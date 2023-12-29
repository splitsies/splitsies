import { IImage } from "../models/image/image-interface";

export type RootStackScreenParams = {
    LoginScreen: undefined;
    SignupScreen: undefined;
    RootScreen: undefined;
    ExpenseScreen: undefined;
    CameraScreen: undefined;
    ImageScreen: { image: IImage };
};

export type DrawerParamList = {
    Home: undefined;
    Profile: undefined;
};
