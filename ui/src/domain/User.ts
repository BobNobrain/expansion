export type User = {
    id: string;
    username: string;
    created: Date;
    status: {
        license: string;
        isVerified: boolean;
    };
};

export type CurrentUserData = {
    user: User;
};
