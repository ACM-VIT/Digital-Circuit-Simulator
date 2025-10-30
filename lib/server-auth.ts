import { auth } from "@clerk/nextjs/server";
import { getCurrentUser, getUserByClerkId } from "@/lib/auth";
import { DatabaseUser } from "@/lib/auth";

export async function getServerUser(): Promise<DatabaseUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return await getCurrentUser();

  // Mock user for testing without Clerk
  // return {
  //   id: 'temp-user-id',
  //   clerk_user_id: 'temp-clerk-id',
  //   email: 'test@example.com',
  //   email_verified: true,
  //   username: 'testuser',
  //   first_name: 'Test',
  //   last_name: 'User',
  //   image_url: null,
  //   phone_number: null,
  //   phone_verified: false,
  //   last_sign_in_at: new Date(),
  //   created_at: new Date(),
  //   updated_at: new Date()
  // }
}

export async function getServerUserById(
  clerkUserId: string
): Promise<DatabaseUser | null> {
  return await getUserByClerkId(clerkUserId);
}

export async function requireAuth(): Promise<DatabaseUser> {
  const user = await getServerUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  // const userId = "temp-clerk-id"; //mock user
  return userId;
}
