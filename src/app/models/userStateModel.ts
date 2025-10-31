export interface UserState {
    isLoggedIn: boolean;
    user?: UserModel
}

// JWT'de neler dönüyor?
export interface UserModel {
    sub: string;
    roles: string[];
}