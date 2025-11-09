import axios from 'axios';
import { PostJob, LinkedInProfile } from '../types';

export class LinkedInService {
  private static readonly API_BASE_URL = 'https://api.linkedin.com/v2';

  static async getProfile(accessToken: string): Promise<LinkedInProfile> {
    try {
      // Try OpenID Connect endpoint first
      try {
        const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });
        
        return {
          id: response.data.sub || response.data.id,
          firstName: response.data.given_name || '',
          lastName: response.data.family_name || '',
          profilePicture: response.data.picture
        };
      } catch (openIdError) {
        // Fallback to legacy endpoint
        const response = await axios.get(`${this.API_BASE_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });

        return {
          id: response.data.id,
          firstName: response.data.firstName?.localized?.en_US || '',
          lastName: response.data.lastName?.localized?.en_US || '',
          profilePicture: response.data.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier
        };
      }
    } catch (error) {
      console.error('LinkedIn profile fetch error:', error);
      throw new Error('Failed to fetch LinkedIn profile');
    }
  }

  static async postContent(job: PostJob, accessToken: string): Promise<string> {
    try {
      // First, get the user's LinkedIn profile ID
      const profile = await this.getProfile(accessToken);
      
      // Prepare the post content
      const postData = {
        author: `urn:li:person:${profile.id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: job.content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      // If there are images, add them to the post
      if (job.images && job.images.length > 0) {
        // For images, we need to upload them first and get URNs
        const imageUrns = await this.uploadImages(job.images, accessToken);
        
        (postData.specificContent as any)['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
        (postData.specificContent as any)['com.linkedin.ugc.ShareContent'].media = imageUrns.map(urn => ({
          status: 'READY',
          description: {
            text: job.content
          },
          media: urn,
          title: {
            text: 'Image'
          }
        }));
      }

      // Post to LinkedIn
      const response = await axios.post(`${this.API_BASE_URL}/ugcPosts`, postData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json'
        }
      });

      console.log('LinkedIn post successful:', JSON.stringify(response.data, null, 2));
      console.log('LinkedIn response headers:', JSON.stringify(response.headers, null, 2));
      
      // Extract post ID from response
      // LinkedIn returns the ID in the Location header or in response.data.id
      // Format: urn:li:ugcPost:xxxxx or just the numeric ID
      let postId = null;
      
      if (response.headers.location) {
        // Extract from Location header: /ugcPosts/urn:li:ugcPost:xxxxx
        const locationMatch = response.headers.location.match(/urn:li:ugcPost:([^\/]+)/);
        if (locationMatch) {
          postId = `urn:li:ugcPost:${locationMatch[1]}`;
        } else {
          const locationId = response.headers.location.split('/').pop();
          postId = locationId?.startsWith('urn:') ? locationId : `urn:li:ugcPost:${locationId}`;
        }
      } else if (response.data.id) {
        postId = response.data.id.startsWith('urn:') ? response.data.id : `urn:li:ugcPost:${response.data.id}`;
      } else if (response.headers['x-linkedin-id']) {
        const linkedInId = response.headers['x-linkedin-id'];
        postId = linkedInId.startsWith('urn:') ? linkedInId : `urn:li:ugcPost:${linkedInId}`;
      }
      
      if (!postId) {
        console.warn('Could not extract LinkedIn post ID from response:', response.data);
        throw new Error('Failed to extract LinkedIn post ID from response');
      }
      
      console.log('Extracted LinkedIn post ID:', postId);
      return postId;
    } catch (error) {
      console.error('LinkedIn post error:', error);
      throw new Error('Failed to post to LinkedIn');
    }
  }

  static async uploadImages(imageUrls: string[], accessToken: string): Promise<string[]> {
    try {
      const imageUrns: string[] = [];

      for (const imageUrl of imageUrls) {
        // Register upload
        const registerResponse = await axios.post(`${this.API_BASE_URL}/assets?action=registerUpload`, {
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: `urn:li:person:${accessToken}`,
            serviceRelationships: [{
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }]
          }
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
          }
        });

        const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        const asset = registerResponse.data.value.asset;

        // Upload the image
        const imageResponse = await axios.get(imageUrl);
        await axios.put(uploadUrl, imageResponse.data, {
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });

        imageUrns.push(asset);
      }

      return imageUrns;
    } catch (error) {
      console.error('LinkedIn image upload error:', error);
      throw new Error('Failed to upload images to LinkedIn');
    }
  }

  static async getPostAnalytics(linkedinPostId: string, accessToken: string): Promise<{ impressions: number; likes: number; comments: number; reposts: number }> {
    try {
      // Ensure we have a proper URN format
      const postUrn = linkedinPostId.startsWith('urn:li:ugcPost:') 
        ? linkedinPostId 
        : `urn:li:ugcPost:${linkedinPostId}`;

      console.log(`📊 Fetching analytics for LinkedIn post: ${postUrn}`);

      // Method 1: Try Social Actions API - This is the most reliable for engagement metrics
      // This endpoint returns likes, comments, and shares
      let engagementData = { likes: 0, comments: 0, reposts: 0 };
      try {
        const socialResponse = await axios.get(`${this.API_BASE_URL}/socialActions/${encodeURIComponent(postUrn)}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });

        console.log('✅ Social actions response:', JSON.stringify(socialResponse.data, null, 2));
        
        const socialData = socialResponse.data;
        engagementData = {
          likes: socialData.likes?.total || socialData.likeCount || 0,
          comments: socialData.comments?.total || socialData.commentCount || 0,
          reposts: socialData.shares?.total || socialData.shareCount || 0
        };
      } catch (socialError: any) {
        console.log('❌ Social actions endpoint failed:', {
          status: socialError.response?.status,
          message: socialError.message,
          data: socialError.response?.data
        });
      }

      // Method 2: Try to get impressions using Analytics API
      // Note: LinkedIn Analytics API for personal posts requires special permissions
      let impressions = 0;
      try {
        // Try Share Statistics API - works for shares/UGC posts
        const statsResponse = await axios.get(`${this.API_BASE_URL}/networkSizes/${encodeURIComponent(postUrn)}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        });

        console.log('✅ Network sizes response:', JSON.stringify(statsResponse.data, null, 2));
        
        if (statsResponse.data && statsResponse.data.values && statsResponse.data.values.length > 0) {
          const data = statsResponse.data.values[0];
          impressions = data.impressionCount || data.viewerCount || data.impressions || 0;
        }
      } catch (networkError: any) {
        console.log('❌ Network sizes endpoint failed:', {
          status: networkError.response?.status,
          message: networkError.message
        });
        
        // Try alternative: Use UGC Post details with statistics
        try {
          const ugcResponse = await axios.get(`${this.API_BASE_URL}/ugcPosts/${encodeURIComponent(postUrn)}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0'
            },
            params: {
              projection: '(id,statistics)'
            }
          });

          console.log('✅ UGC Post statistics response:', JSON.stringify(ugcResponse.data, null, 2));
          
          if (ugcResponse.data && ugcResponse.data.statistics) {
            const stats = ugcResponse.data.statistics;
            impressions = stats.impressionCount || stats.viewCount || stats.impressions || 0;
          }
        } catch (ugcError: any) {
          console.log('❌ UGC Post statistics projection failed:', {
            status: ugcError.response?.status,
            message: ugcError.message
          });
        }
      }

      // Method 3: Try Analytics aggregation with UGC post
      if (impressions === 0) {
        try {
          const analyticsResponse = await axios.get(`${this.API_BASE_URL}/analytics`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0'
            },
            params: {
              q: 'ugcPosts',
              'pivot': 'MEMBER_SHARE',
              'timeRange.start': Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60), // Last 7 days
              'timeRange.end': Math.floor(Date.now() / 1000),
              'ugcPosts[0]': postUrn
            }
          });

          console.log('✅ Analytics aggregation response:', JSON.stringify(analyticsResponse.data, null, 2));
          
          if (analyticsResponse.data && analyticsResponse.data.elements && analyticsResponse.data.elements.length > 0) {
            const element = analyticsResponse.data.elements[0];
            impressions = element.impressionCount || element.viewCount || element.impressions || impressions;
          }
        } catch (analyticsError: any) {
          console.log('❌ Analytics aggregation endpoint failed:', {
            status: analyticsError.response?.status,
            message: analyticsError.message
          });
        }
      }

      const result = {
        impressions,
        likes: engagementData.likes,
        comments: engagementData.comments,
        reposts: engagementData.reposts
      };

      console.log('📊 Final analytics result:', result);
      
      // If we have engagement but no impressions, LinkedIn API may not provide impressions for personal posts
      if (result.impressions === 0 && (result.likes > 0 || result.comments > 0 || result.reposts > 0)) {
        console.warn('⚠️ Got engagement metrics but no impressions. LinkedIn API may not provide impressions for personal profile posts.');
        console.warn('Note: LinkedIn Analytics API typically requires Marketing Developer Platform access and may only provide impressions for Company pages.');
      }

      return result;
    } catch (error: any) {
      console.error('❌ LinkedIn analytics error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      return {
        impressions: 0,
        likes: 0,
        comments: 0,
        reposts: 0
      };
    }
  }
}
