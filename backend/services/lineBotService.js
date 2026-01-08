// LINE Bot Service
// Handle LINE Bot interactions and integrate with existing services

const line = require('@line/bot-sdk');
const aiService = require('./aiService');
const { db, pool } = require('../database');
const logger = require('../utils/logger');

// LINE Bot configuration
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

const client = new line.Client(config);

class LineBotService {
  /**
   * Download image from LINE Content API
   */
  async downloadLineImage(messageId) {
    try {
      const stream = await client.getMessageContent(messageId);
      const chunks = [];
      
      return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      logger.error('Error downloading LINE image:', error);
      throw error;
    }
  }

  /**
   * Handle image message - scan bill and return result
   */
  async handleImageMessage(messageId, userId) {
    try {
      logger.info(`Processing image message from user: ${userId}`);
      
      // 1. Download image from LINE
      const imageBuffer = await this.downloadLineImage(messageId);
      const base64Image = imageBuffer.toString('base64');
      
      // 2. Scan bill with AI (ใช้ code เดิม!)
      const scanResult = await aiService.scanBill(base64Image);
      
      // 3. Get user's active projects for selection
      const projects = await this.getUserProjects(userId);
      
      // 4. Format response for LINE
      return {
        type: 'flex',
        altText: 'ผลการสแกนบิล',
        contents: this.formatBillScanResult(scanResult, projects)
      };
    } catch (error) {
      logger.error('Error handling image message:', error);
      return {
        type: 'text',
        text: `❌ เกิดข้อผิดพลาด: ${error.message}\n\nกรุณาลองใหม่อีกครั้ง หรือส่งรูปบิลที่ชัดเจนขึ้น`
      };
    }
  }

  /**
   * Format bill scan result as Flex Message
   */
  formatBillScanResult(scanResult, projects = []) {
    const items = scanResult.items || [];
    const itemsText = items.slice(0, 5).map((item, idx) => 
      `${idx + 1}. ${item.plantName || item.name || 'N/A'} - ${item.quantity || 0} ${item.size || ''} - ${item.price || 0} บาท`
    ).join('\n');
    
    const moreItems = items.length > 5 ? `\n... และอีก ${items.length - 5} รายการ` : '';

    return {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '📄 ผลการสแกนบิล',
            weight: 'bold',
            size: 'xl',
            color: '#FFFFFF'
          }
        ],
        backgroundColor: '#1DB446',
        paddingAll: '20px'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `ร้าน: ${scanResult.supplierName || 'N/A'}`,
            weight: 'bold',
            size: 'lg',
            margin: 'md'
          },
          {
            type: 'text',
            text: `วันที่: ${scanResult.billDate || 'N/A'}`,
            size: 'sm',
            color: '#666666',
            margin: 'sm'
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'text',
            text: `ยอดรวม: ${scanResult.totalAmount || 0} บาท`,
            weight: 'bold',
            size: 'xl',
            color: '#1DB446',
            margin: 'md'
          },
          {
            type: 'text',
            text: `จำนวนรายการ: ${items.length} รายการ`,
            size: 'sm',
            color: '#666666',
            margin: 'sm'
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'text',
            text: '📋 รายการ:',
            weight: 'bold',
            size: 'sm',
            margin: 'md'
          },
          {
            type: 'text',
            text: itemsText + moreItems,
            size: 'sm',
            color: '#666666',
            margin: 'sm',
            wrap: true
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '💾 บันทึก',
              data: JSON.stringify({
                action: 'save_bill',
                scanResult: scanResult
              })
            },
            color: '#1DB446'
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '❌ ยกเลิก',
              data: JSON.stringify({
                action: 'cancel_bill'
              })
            }
          }
        ]
      }
    };
  }

  /**
   * Handle postback - save bill or select project
   */
  async handlePostback(postbackData, userId) {
    try {
      const data = JSON.parse(postbackData);
      
      if (data.action === 'save_bill') {
        // Get user's projects for selection
        const projects = await this.getUserProjects(userId);
        
        if (projects.length === 0) {
          // No projects, save directly
          return await this.saveBill(data.scanResult, userId, null);
        } else {
          // Show project selection
          return this.formatProjectSelection(data.scanResult, projects, userId);
        }
      } else if (data.action === 'select_project') {
        // Save bill with selected project
        return await this.saveBill(data.scanResult, userId, data.projectId);
      } else if (data.action === 'save_without_project') {
        // Save bill without project
        return await this.saveBill(data.scanResult, userId, null);
      }
    } catch (error) {
      logger.error('Error handling postback:', error);
      return {
        type: 'text',
        text: `❌ เกิดข้อผิดพลาด: ${error.message}`
      };
    }
  }

  /**
   * Format project selection message
   */
  formatProjectSelection(scanResult, projects, userId) {
    const projectButtons = projects.slice(0, 4).map(project => ({
      type: 'button',
      style: 'secondary',
      height: 'sm',
      action: {
        type: 'postback',
        label: project.name,
        data: JSON.stringify({
          action: 'select_project',
          scanResult: scanResult,
          projectId: project.id
        })
      }
    }));

    return {
      type: 'flex',
      altText: 'เลือกโปรเจค',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '📁 เลือกโปรเจค',
              weight: 'bold',
              size: 'lg',
              margin: 'md'
            },
            {
              type: 'text',
              text: `ยอดรวม: ${scanResult.totalAmount || 0} บาท`,
              size: 'sm',
              color: '#666666',
              margin: 'sm'
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            ...projectButtons,
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '💾 บันทึก (ไม่ระบุโปรเจค)',
                data: JSON.stringify({
                  action: 'save_without_project',
                  scanResult: scanResult
                })
              },
              color: '#1DB446'
            }
          ]
        }
      }
    };
  }

  /**
   * Save bill to database
   */
  async saveBill(scanResult, userId, projectId) {
    try {
      // Use existing createBill function
      const bill = await db.createBill({
        supplierId: null,
        supplierName: scanResult.supplierName,
        supplierPhone: scanResult.supplierPhone || null,
        supplierLocation: scanResult.supplierLocation || null,
        billDate: scanResult.billDate ? new Date(scanResult.billDate) : new Date(),
        totalAmount: parseFloat(scanResult.totalAmount) || 0,
        imageUrl: null,
        notes: projectId ? `LINE Bot - Project: ${projectId}` : 'LINE Bot'
      });

      // Add bill items
      if (scanResult.items && scanResult.items.length > 0) {
        for (const item of scanResult.items) {
          await db.addBillItem(bill.id, {
            plantName: item.plantName || item.name || 'Unknown',
            quantity: item.quantity || 1,
            price: parseFloat(item.price) || 0,
            totalPrice: parseFloat(item.totalPrice) || parseFloat(item.price) || 0,
            size: item.size || null,
            notes: null
          });
        }
      }

      // Link to project if provided
      if (projectId) {
        await this.linkBillToProject(bill.id, projectId);
      }

      // Link to user
      await this.linkBillToUser(bill.id, userId);

      return {
        type: 'text',
        text: `✅ บันทึกสำเร็จ!\n\n📄 บิล ID: ${bill.id}\n💰 ยอดรวม: ${bill.total_amount} บาท\n📋 จำนวนรายการ: ${scanResult.items?.length || 0} รายการ${projectId ? `\n📁 โปรเจค: ${projectId}` : ''}`
      };
    } catch (error) {
      logger.error('Error saving bill:', error);
      throw error;
    }
  }

  /**
   * Handle text commands
   */
  async handleTextMessage(text, userId) {
    const command = text.trim().toLowerCase();
    
    if (command.startsWith('/newproject ')) {
      const projectName = text.replace('/newproject ', '').trim();
      return await this.createProject(projectName, userId);
    } else if (command === '/projects' || command === '/โปรเจค') {
      return await this.listProjects(userId);
    } else if (command.startsWith('/summary ')) {
      const projectName = text.replace('/summary ', '').trim();
      return await this.getProjectSummary(projectName, userId);
    } else if (command === '/help' || command === '/ช่วยเหลือ') {
      return this.getHelpMessage();
    } else if (command === '/report เดือนนี้' || command === '/report this month') {
      return await this.getMonthlyReport(userId);
    } else {
      return {
        type: 'text',
        text: 'สวัสดีครับ! 👋\n\nส่งรูปบิลมาเพื่อสแกน หรือพิมพ์ /help เพื่อดูคำสั่งทั้งหมด'
      };
    }
  }

  /**
   * Create new project
   */
  async createProject(projectName, userId) {
    try {
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await pool.query(
        `INSERT INTO projects (id, user_id, name, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [projectId, userId, projectName]
      );

      return {
        type: 'text',
        text: `✅ สร้างโปรเจค "${projectName}" สำเร็จ!\n\n📁 Project ID: ${projectId}\n\nตอนนี้คุณสามารถส่งบิลมาแล้วระบุโปรเจคได้`
      };
    } catch (error) {
      logger.error('Error creating project:', error);
      return {
        type: 'text',
        text: `❌ เกิดข้อผิดพลาด: ${error.message}`
      };
    }
  }

  /**
   * Get user's projects
   */
  async getUserProjects(userId) {
    try {
      const result = await pool.query(
        `SELECT id, name, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error getting user projects:', error);
      return [];
    }
  }

  /**
   * List user's projects
   */
  async listProjects(userId) {
    try {
      const projects = await this.getUserProjects(userId);
      
      if (projects.length === 0) {
        return {
          type: 'text',
          text: '📁 คุณยังไม่มีโปรเจค\n\nพิมพ์ /newproject <ชื่อโปรเจค> เพื่อสร้างโปรเจคใหม่'
        };
      }

      const projectsText = projects.map((p, idx) => 
        `${idx + 1}. ${p.name} (${p.id})`
      ).join('\n');

      return {
        type: 'text',
        text: `📁 โปรเจคของคุณ:\n\n${projectsText}\n\nพิมพ์ /summary <ชื่อโปรเจค> เพื่อดูสรุปค่าใช้จ่าย`
      };
    } catch (error) {
      logger.error('Error listing projects:', error);
      return {
        type: 'text',
        text: `❌ เกิดข้อผิดพลาด: ${error.message}`
      };
    }
  }

  /**
   * Get project summary
   */
  async getProjectSummary(projectName, userId) {
    try {
      const projectResult = await pool.query(
        `SELECT id, name FROM projects WHERE user_id = $1 AND LOWER(name) = LOWER($2)`,
        [userId, projectName]
      );

      if (projectResult.rows.length === 0) {
        return {
          type: 'text',
          text: `❌ ไม่พบโปรเจค "${projectName}"\n\nพิมพ์ /projects เพื่อดูรายการโปรเจคทั้งหมด`
        };
      }

      const project = projectResult.rows[0];
      
      // Get bills for this project
      const billsResult = await pool.query(
        `SELECT b.id, b.total_amount, b.bill_date, b.supplier_name
         FROM bills b
         INNER JOIN bill_projects bp ON b.id = bp.bill_id
         WHERE bp.project_id = $1
         ORDER BY b.bill_date DESC`,
        [project.id]
      );

      const bills = billsResult.rows;
      const totalAmount = bills.reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

      const billsText = bills.slice(0, 10).map((bill, idx) => 
        `${idx + 1}. ${bill.bill_date?.toISOString().split('T')[0] || 'N/A'} - ${bill.supplier_name || 'N/A'} - ${bill.total_amount || 0} บาท`
      ).join('\n');

      return {
        type: 'text',
        text: `📊 สรุปโปรเจค: ${project.name}\n\n💰 ค่าใช้จ่ายรวม: ${totalAmount.toLocaleString()} บาท\n📋 จำนวนบิล: ${bills.length} ใบ\n\n📝 รายการบิล:\n${billsText}${bills.length > 10 ? `\n... และอีก ${bills.length - 10} ใบ` : ''}`
      };
    } catch (error) {
      logger.error('Error getting project summary:', error);
      return {
        type: 'text',
        text: `❌ เกิดข้อผิดพลาด: ${error.message}`
      };
    }
  }

  /**
   * Get monthly report
   */
  async getMonthlyReport(userId) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const billsResult = await pool.query(
        `SELECT b.total_amount, b.supplier_name, b.bill_date
         FROM bills b
         INNER JOIN bill_users bu ON b.id = bu.bill_id
         WHERE bu.user_id = $1 AND b.bill_date >= $2
         ORDER BY b.bill_date DESC`,
        [userId, startOfMonth]
      );

      const bills = billsResult.rows;
      const totalAmount = bills.reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);
      
      // Count suppliers
      const suppliers = [...new Set(bills.map(b => b.supplier_name))];

      return {
        type: 'text',
        text: `📊 สรุปรายเดือน: ${now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}\n\n💰 ค่าใช้จ่ายรวม: ${totalAmount.toLocaleString()} บาท\n📋 จำนวนบิล: ${bills.length} ใบ\n🏢 จำนวนร้าน: ${suppliers.length} ร้าน`
      };
    } catch (error) {
      logger.error('Error getting monthly report:', error);
      return {
        type: 'text',
        text: `❌ เกิดข้อผิดพลาด: ${error.message}`
      };
    }
  }

  /**
   * Link bill to project
   */
  async linkBillToProject(billId, projectId) {
    try {
      await pool.query(
        `INSERT INTO bill_projects (bill_id, project_id, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (bill_id, project_id) DO NOTHING`,
        [billId, projectId]
      );
    } catch (error) {
      logger.error('Error linking bill to project:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Link bill to user
   */
  async linkBillToUser(billId, userId) {
    try {
      await pool.query(
        `INSERT INTO bill_users (bill_id, user_id, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (bill_id, user_id) DO NOTHING`,
        [billId, userId]
      );
    } catch (error) {
      logger.error('Error linking bill to user:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Get help message
   */
  getHelpMessage() {
    return {
      type: 'text',
      text: `📱 คำสั่งทั้งหมด:\n\n📄 ส่งรูปบิล → สแกนบิลอัตโนมัติ\n\n📁 /newproject <ชื่อ> → สร้างโปรเจคใหม่\n📁 /projects → ดูรายการโปรเจค\n📊 /summary <ชื่อโปรเจค> → สรุปค่าใช้จ่ายโปรเจค\n📊 /report เดือนนี้ → สรุปรายเดือน\n❓ /help → แสดงคำสั่งทั้งหมด`
    };
  }
}

module.exports = new LineBotService();

