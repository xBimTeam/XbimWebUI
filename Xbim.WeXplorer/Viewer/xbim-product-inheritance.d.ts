declare namespace Xbim.Viewer {
    var ProductInheritance: {
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
}
