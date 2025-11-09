import { Response } from 'express';
import { AuthenticatedRequest, CreateAutomationRequest, UpdateAutomationRequest, ApiResponse } from '../types';
import prisma from '../utils/database';

export class AutomationController {
  static async getAutomations(req: AuthenticatedRequest, res: Response) {
    try {
      const automations = await prisma.automation.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' }
      });

      // Parse topics from JSON string to array
      const automationsWithParsedTopics = automations.map(automation => ({
        ...automation,
        topics: JSON.parse(automation.topics)
      }));

      res.json({
        success: true,
        data: automationsWithParsedTopics,
        message: 'Automations retrieved successfully'
      });
    } catch (error) {
      console.error('Get automations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve automations'
      });
    }
  }

  static async createAutomation(req: any, res: Response) {
    try {
      const { name, topics, frequency, time } = req.body;

      const automation = await prisma.automation.create({
        data: {
          userId: req.user!.id,
          name,
          topics: JSON.stringify(topics), // Store as JSON string
          frequency,
          time,
          status: 'ACTIVE'
        }
      });

      // Parse topics back to array for response
      const responseData = {
        ...automation,
        topics: JSON.parse(automation.topics)
      };

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Automation created successfully'
      });
    } catch (error) {
      console.error('Create automation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create automation'
      });
    }
  }

  static async updateAutomation(req: any, res: Response) {
    try {
      const { automationId } = req.params;
      const { name, topics, frequency, time, status } = req.body;

      // Check if automation belongs to user
      const existingAutomation = await prisma.automation.findFirst({
        where: { 
          id: automationId,
          userId: req.user!.id 
        }
      });

      if (!existingAutomation) {
        return res.status(404).json({
          success: false,
          error: 'Automation not found'
        });
      }

      // Update automation
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (topics !== undefined) updateData.topics = JSON.stringify(topics);
      if (frequency !== undefined) updateData.frequency = frequency;
      if (time !== undefined) updateData.time = time;
      if (status !== undefined) updateData.status = status;

      const automation = await prisma.automation.update({
        where: { id: automationId },
        data: updateData
      });

      // Parse topics back to array for response
      const responseData = {
        ...automation,
        topics: JSON.parse(automation.topics)
      };

      res.json({
        success: true,
        data: responseData,
        message: 'Automation updated successfully'
      });
    } catch (error) {
      console.error('Update automation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update automation'
      });
    }
  }

  static async deleteAutomation(req: any, res: Response) {
    try {
      const { automationId } = req.params;

      // Check if automation belongs to user
      const existingAutomation = await prisma.automation.findFirst({
        where: { 
          id: automationId,
          userId: req.user!.id 
        }
      });

      if (!existingAutomation) {
        return res.status(404).json({
          success: false,
          error: 'Automation not found'
        });
      }

      // Delete automation
      await prisma.automation.delete({
        where: { id: automationId }
      });

      res.json({
        success: true,
        message: 'Automation deleted successfully'
      });
    } catch (error) {
      console.error('Delete automation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete automation'
      });
    }
  }
}
