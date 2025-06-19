/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { authenticate } from '@google-cloud/local-auth';
import { auth } from 'google-auth-library';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class GoogleMeetService {
  private readonly logger = new Logger(GoogleMeetService.name);
  private authClient: import('google-auth-library').OAuth2Client | null;

  // Scopes và paths
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/meetings.space.created',
  ];
  private readonly TOKEN_PATH = path.join(process.cwd(), 'token.json');
  private readonly CREDENTIALS_PATH = path.join(
    process.cwd(),
    'credentials.json',
  );

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication
   */
  private async initializeAuth() {
    try {
      this.authClient = await this.authorize();
      this.logger.log('✅ Google Meet service initialized successfully');
    } catch (error) {
      this.logger.error(
        '❌ Failed to initialize Google Meet service:',
        error.message,
      );
    }
  }

  /**
   * Load saved credentials if exist
   */
  private async loadSavedCredentialsIfExist(): Promise<
    import('google-auth-library').OAuth2Client | null
  > {
    try {
      this.logger.debug('🔍 Kiểm tra token đã lưu...');
      const content = await fs.readFile(this.TOKEN_PATH);
      const credentials = JSON.parse(content.toString());
      this.logger.debug('✅ Tìm thấy token đã lưu');
      return auth.fromJSON(
        credentials,
      ) as import('google-auth-library').OAuth2Client;
    } catch (err) {
      this.logger.debug('ℹ️ Không tìm thấy token đã lưu');
      return null;
    }
  }

  /**
   * Save credentials to file
   */
  private async saveCredentials(client: any) {
    try {
      const content = await fs.readFile(this.CREDENTIALS_PATH);
      const keys = JSON.parse(content.toString());
      const key = keys.installed || keys.web;

      const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
      });

      await fs.writeFile(this.TOKEN_PATH, payload);
      this.logger.debug('💾 Đã lưu token vào token.json');
    } catch (error) {
      this.logger.error('❌ Lỗi lưu token:', error.message);
    }
  }

  /**
   * Authorize user
   */
  private async authorize(): Promise<
    import('google-auth-library').OAuth2Client
  > {
    try {
      // Kiểm tra token đã lưu
      const client = await this.loadSavedCredentialsIfExist();
      if (client !== null) {
        this.logger.debug('🔐 Sử dụng token đã lưu');
        return client;
      } else {
        throw new Error('No valid OAuth2Client found');
      }

      // // Kiểm tra credentials.json
      // this.logger.debug('📋 Kiểm tra credentials.json...');
      // const content = await fs.readFile(this.CREDENTIALS_PATH);
      // const credentials = JSON.parse(content.toString());

      // // Validate OAuth format
      // if (!credentials.installed && !credentials.web) {
      //   this.logger.error('❌ credentials.json không đúng format OAuth 2.0');
      //   this.logger.log(
      //     '💡 Cần tạo OAuth 2.0 Client ID, không phải Service Account',
      //   );
      //   this.logger.log(
      //     '🔗 Hướng dẫn: https://console.cloud.google.com/apis/credentials',
      //   );
      //   throw new Error('Invalid credentials format');
      // }

      // this.logger.debug('✅ credentials.json đúng format OAuth 2.0');
      // this.logger.debug('🚀 Bắt đầu OAuth flow...');

      // // OAuth flow
      // client = await authenticate({
      //   scopes: this.SCOPES,
      //   keyfilePath: this.CREDENTIALS_PATH,
      // });

      // if (client && client.credentials) {
      //   await this.saveCredentials(client);
      // }

      // this.logger.debug('✅ OAuth authorization thành công');
      // return client;
    } catch (error) {
      this.logger.error('❌ Lỗi authorization:', error.message);
      throw error;
    }
  }

  /**
   * Ensure client is authenticated
   */
  private async ensureAuthenticated() {
    if (!this.authClient) {
      this.authClient = await this.authorize();
    }
    return this.authClient;
  }

  /**
   * Create Google Meet space
   */
  async createMeetingSpace(): Promise<any> {
    try {
      this.logger.log('🚀 Đang tạo Google Meet space...');

      // Ensure authentication
      const authClient = await this.ensureAuthenticated();

      // Get access token
      const accessToken = await authClient.getAccessToken();
      this.logger.debug('🔑 Đã lấy access token');

      // Call Meet API
      const response = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      this.logger.debug(`📡 API Response Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const meetingSpace = await response.json();

      // Display results
      this.logger.log('🎉 Tạo meeting thành công!');
      this.logger.log('═══════════════════════════════════════');
      this.logger.log(`🎯 Meet URL: ${meetingSpace.meetingUri}`);
      this.logger.log(`📋 Space Name: ${meetingSpace.name}`);
      this.logger.log(`🔗 Meeting Code: ${meetingSpace.meetingCode || 'N/A'}`);
      this.logger.log('═══════════════════════════════════════');

      return {
        success: true,
        data: {
          meetingUri: meetingSpace.meetingUri,
          spaceName: meetingSpace.name,
          meetingCode: meetingSpace.meetingCode || null,
        },
      };
    } catch (error) {
      this.logger.error('❌ Lỗi tạo meeting:', error.message);

      // Troubleshooting hints
      this.logger.log('🔧 Hướng dẫn khắc phục:');

      if (error.message.includes('403')) {
        this.logger.log(
          '1. ❌ Đang dùng Service Account - cần chuyển sang OAuth 2.0',
        );
        this.logger.log(
          '2. 🔗 Tạo OAuth 2.0 Client ID tại: https://console.cloud.google.com/apis/credentials',
        );
        this.logger.log('3. 📱 Chọn "Desktop application"');
        this.logger.log('4. 📥 Download JSON và thay thế credentials.json');
      } else if (error.message.includes('Invalid credentials format')) {
        this.logger.log('1. 📋 File credentials.json phải có format OAuth 2.0');
        this.logger.log('2. 🔍 Kiểm tra có key "installed" hoặc "web"');
        this.logger.log('3. 🚫 Không dùng Service Account cho Meet API');
      } else if (error.message.includes('API not enabled')) {
        this.logger.log(
          '1. 🔧 Enable Google Meet API trong Google Cloud Console',
        );
        this.logger.log(
          '2. 🔗 Link: https://console.cloud.google.com/apis/library/meet.googleapis.com',
        );
      }

      throw new Error(`Failed to create meeting: ${error.message}`);
    }
  }

  /**
   * Create meeting with custom configuration
   */
  async createMeetingWithConfig(config?: {
    displayName?: string;
    description?: string;
  }): Promise<any> {
    try {
      this.logger.log('🚀 Đang tạo Google Meet space với config...');

      const authClient = await this.ensureAuthenticated();
      const accessToken = await authClient.getAccessToken();

      const requestBody: any = {};

      if (config?.displayName) {
        requestBody.config = {
          entryPointAccess: {
            accessCodes: [
              {
                code: config.displayName,
              },
            ],
          },
        };
      }

      const response = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const meetingSpace = await response.json();

      this.logger.log('🎉 Configured meeting created successfully!');
      this.logger.log(`🎯 Meet URL: ${meetingSpace.meetingUri}`);

      return {
        success: true,
        data: {
          meetingUri: meetingSpace.meetingUri,
          spaceName: meetingSpace.name,
          meetingCode: meetingSpace.meetingCode || null,
          config: config || null,
        },
      };
    } catch (error) {
      this.logger.error('❌ Error creating configured meeting:', error.message);
      throw new Error(`Failed to create configured meeting: ${error.message}`);
    }
  }

  /**
   * Test authentication and token
   */
  async testAuth(): Promise<any> {
    try {
      this.logger.log('🔍 Testing authentication...');

      const authClient = await this.ensureAuthenticated();
      const accessToken = await authClient.getAccessToken();

      this.logger.log('✅ Authentication test successful');
      this.logger.log(`🔑 Token: ${accessToken.token?.substring(0, 20)}...`);

      return {
        success: true,
        authenticated: true,
        tokenPreview: accessToken.token?.substring(0, 20) + '...',
      };
    } catch (error) {
      this.logger.error('❌ Authentication test failed:', error.message);
      return {
        success: false,
        authenticated: false,
        error: error.message,
      };
    }
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<{ status: string; authenticated: boolean }> {
    try {
      const authClient = await this.ensureAuthenticated();
      const accessToken = await authClient.getAccessToken();
      const hasValidToken = !!accessToken.token;

      return {
        status: 'healthy',
        authenticated: hasValidToken,
      };
    } catch (error) {
      return {
        status: 'error',
        authenticated: false,
      };
    }
  }
}
