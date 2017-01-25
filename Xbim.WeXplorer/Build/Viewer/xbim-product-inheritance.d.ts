export declare var xProductInheritance: {
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
