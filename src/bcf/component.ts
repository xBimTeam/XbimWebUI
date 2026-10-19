
/**
 * @category BCF
 */
export class Component {
    /**
     * IFC guid of the component
     */
    public ifc_guid: string;

    /**
     * originating system of the component
     */
    public originating_system: string;

    /**
     * internal id for the authoring tool of the component
     */
    public authoring_tool_id: string;

    /**
     * Creates a new component instances
     */
    constructor(guid?: string) {
        this.ifc_guid = guid;
        this.originating_system = "xBIM";
        this.authoring_tool_id = "";
    }

    /**
     * Creates a component from the supplied identity, without applying any defaults
     */
    public static from(identity: { ifc_guid?: string, originating_system?: string, authoring_tool_id?: string }): Component {
        const c = new Component();
        c.ifc_guid = identity.ifc_guid;
        c.originating_system = identity.originating_system;
        c.authoring_tool_id = identity.authoring_tool_id;
        return c;
    }
}