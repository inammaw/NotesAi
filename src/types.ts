import { Timestamp } from "firebase/firestore";

export type Role = "teacher" | "student";

export interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  displayName?: string;
  phoneNumber?: string;
  voiceProfileId?: string;
  createdAt: Timestamp;
}

export interface Classroom {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  inviteCode: string;
  createdAt: Timestamp;
}

export interface Note {
  id: string;
  classroomId: string;
  teacherId: string;
  title: string;
  content: string;
  summary: string;
  transcript: string;
  audioUrl?: string;
  date: Timestamp;
  updatedAt: Timestamp;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}
