import { Timestamp } from "firebase-admin/firestore";
import { UserPost } from "../models";
import { db } from "./index";
import { POSTS_COLLECTION, USERS_COLLECTION } from "../config/constants";

const postsCollection = (userId: string) =>
  db.collection(USERS_COLLECTION).doc(userId).collection(POSTS_COLLECTION);

export const PostManager = {
  /**
   * Creates a new post in user's subcollection
   */
  async createPost(
    userId: string,
    postData: Omit<UserPost, "uid" | "id" | "createdAt">
  ): Promise<UserPost> {
    try {
      const postRef = postsCollection(userId).doc();
      const completePost: UserPost = {
        ...postData,
        uid: userId,
        id: postRef.id,
        createdAt: Timestamp.now(),
      };

      await postRef.set(completePost);
      return completePost;
    } catch (error) {
      console.error("Error creating post:", error);
      throw new Error("Failed to create post");
    }
  },

  /**
   * Gets all posts for a user, ordered by date
   */
  async getUserPosts(userId: string): Promise<UserPost[]> {
    try {
      const snapshot = await postsCollection(userId)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map((doc) => doc.data() as UserPost);
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw new Error("Failed to fetch posts");
    }
  },

  /**
   * Updates an existing post
   */
  async updatePost(
    userId: string,
    postId: string,
    updates: Partial<Omit<UserPost, "id" | "uid" | "createdAt">>
  ): Promise<void> {
    try {
      await postsCollection(userId)
        .doc(postId)
        .update({
          ...updates,
          updatedAt: Timestamp.now(),
        });
    } catch (error) {
      console.error("Error updating post:", error);
      throw new Error("Failed to update post");
    }
  },

  /**
   * Schedules a post for future publishing
   */
  async schedulePost(
    userId: string,
    postId: string,
    publishAt: Date
  ): Promise<void> {
    try {
      await postsCollection(userId)
        .doc(postId)
        .update({
          scheduledFor: Timestamp.fromDate(publishAt),
        });
    } catch (error) {
      console.error("Error scheduling post:", error);
      throw new Error("Failed to schedule post");
    }
  },
};
