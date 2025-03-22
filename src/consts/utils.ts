import { IdentityPlatform } from "@prisma/client";
import { Todo } from "@prisma/client";

//TODO  add neo88 community id
export const initialCommunityId = "";

//TODO define pointsRequired by 松竹梅
export const OnboardingTodoPoints: Record<Todo, number> = {
  [Todo.PROFILE]: 500,
  [Todo.PERSONAL_RECORD]: 500,
  [Todo.FIRST_ACTIVITY]: 500,
  [Todo.FIRST_QUEST]: 500,
};

export const SignInProvider: Record<string, IdentityPlatform> = {
  "oidc.line": IdentityPlatform.LINE,
  "facebook.com": IdentityPlatform.FACEBOOK,
};

export const maxOnboardingRecords: number = 6;
