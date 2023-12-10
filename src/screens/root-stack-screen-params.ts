import { IImage } from "../models/image/image-interface";

export type RootStackScreenParams = {
    LoginScreen: undefined;
    HomeScreen: undefined;
    ExpenseScreen: undefined;
    CameraScreen: undefined;
    ImageScreen: { image: IImage };
};
