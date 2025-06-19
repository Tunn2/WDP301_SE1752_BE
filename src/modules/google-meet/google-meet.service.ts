/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/google-meet/google-meet.service.ts
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import path from 'path';

@Injectable()
export class GoogleMeetService {
  private calendar;
  private auth: JWT;

  constructor() {
    // Khởi tạo authentication

    const keyFilePath = path.join(
      process.cwd(),
      'chromatic-music-447406-u8-ce0cb6bee8e0.json',
    );
    this.auth = new google.auth.JWT({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  async createMeetingLink(meetingDetails: {
    summary: string;
    description?: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
    attendees?: string[]; // Array of email addresses
  }) {
    try {
      const event = {
        summary: meetingDetails.summary,
        description: meetingDetails.description,
        start: {
          dateTime: meetingDetails.startTime,
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: meetingDetails.endTime,
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        attendees: meetingDetails.attendees?.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`, // Unique ID
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
      });

      const meetLink = response.data.conferenceData?.entryPoints?.find(
        (entry) => entry.entryPointType === 'video',
      )?.uri;

      return {
        eventId: response.data.id,
        meetLink: meetLink,
        eventLink: response.data.htmlLink,
      };
    } catch (error) {
      throw new Error(`Không thể tạo Google Meet link: ${error.message}`);
    }
  }
}
