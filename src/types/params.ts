import { IImage } from "../models/image/image-interface";

export type RootStackParamList = {
    LoginScreen: undefined;
    SignupScreen: undefined;
    RootScreen: undefined;
    ExpenseScreen: undefined;
    CameraScreen: undefined;
    ImageScreen: { image: IImage };
    UpdateRequiredScreen: undefined;
};

export type DrawerParamList = {
    Home: undefined;
    Profile: undefined;
    Settings: undefined;
};

export type ExpenseParamList = {
    Items: undefined;
    People: undefined;
    Invite: undefined;
};

export type InviteParamList = {
    Contacts: undefined;
    Guests: undefined;
};

export type FeedParamList = {
    Feed: { expenseId: string | undefined; requestingUserId: string | undefined };
    Requests: { expenseId: string | undefined };
};
