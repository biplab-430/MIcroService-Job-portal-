import { sql } from "../utils/db";


export interface FollowerStatus {
  iFollowThem: boolean;
  theyFollowMe: boolean;
}

export const checkFollowerStatus = async (
  senderId: number,
  receiverId: number
): Promise<FollowerStatus> => {

  const result = await sql`
    SELECT 
      EXISTS(
        SELECT 1 
        FROM followers 
        WHERE follower_id = ${senderId}
        AND following_id = ${receiverId}
      ) AS i_follow_them,

      EXISTS(
        SELECT 1 
        FROM followers 
        WHERE follower_id = ${receiverId}
        AND following_id = ${senderId}
      ) AS they_follow_me
  `;

  return {
    iFollowThem: result[0].i_follow_them,
    theyFollowMe: result[0].they_follow_me,
  };
};