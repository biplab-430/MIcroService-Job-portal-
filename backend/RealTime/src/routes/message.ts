import express from "express";

import { sendMessage, getMessages,
  deleteMessage,
  getConversations,
  markAsRead,
  clearConversation,
  getOrCreateConversation,
  editMessage,
  getGlobalUnreadBadge,
  searchMessages,
  searchConversations, } from "../controller/mes-con.js";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";


const router = express.Router();

router.get("/conversations", isAuth, getConversations);
router.get("/conversations/unread-badge",isAuth, getGlobalUnreadBadge);
router.put("/conversations/mark-read", isAuth, markAsRead);
router.post("/conversations/:receiverId", isAuth, getOrCreateConversation);
router.delete("/conversations/:conversationId/clear",isAuth, clearConversation);
router.get("/search-conversations",isAuth,searchConversations);


router.get("/messages/search",isAuth, searchMessages);
router.get("/get/messages", isAuth, getMessages);
router.post("/messages",isAuth, uploadFile, sendMessage);
router.put("/messages/:messageId",isAuth,editMessage);
router.delete("/delete/messages/:messageId", isAuth, deleteMessage);

export default router;