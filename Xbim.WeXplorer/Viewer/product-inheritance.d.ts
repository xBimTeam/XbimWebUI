export declare let ProductInheritance: {
    name: string;
    id: number;
    abs: boolean;
    children: ({
        name: string;
        id: number;
        abs: boolean;
        children: ({
            name: string;
            id: number;
            abs: boolean;
            children: ({
                name: string;
                id: number;
                abs: boolean;
            } | {
                name: string;
                id: number;
                abs: boolean;
                children: {
                    name: string;
                    id: number;
                    abs: boolean;
                }[];
            })[];
        } | {
            name: string;
            id: number;
            abs: boolean;
        })[];
    } | {
        name: string;
        id: number;
        abs: boolean;
    })[];
};
