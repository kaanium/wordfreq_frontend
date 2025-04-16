export type RegisterProps = {
    onSwitchToLogin: () => void;
};

export type RegisterFormData = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export type RegisterErrors = {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
};

export type AuthPageProps = {
    onLogin: () => void;
};

export type LoginProps = {
    onLogin: () => void;
    onSwitchToRegister: () => void;
};

export type LoginErrors = {
    email: string;
    password: string;
};
