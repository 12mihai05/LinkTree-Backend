import { Folder } from '@prisma/client';
import { SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    allItems?: (Link | Folder)[];
    currentPage?: Int;
    otherUserItems?: (Link | Folder)[];
    otherUserCurrentPage?: Int;
  }
}

declare module 'express' {
  interface Request {
    session: SessionData;
  }
}
