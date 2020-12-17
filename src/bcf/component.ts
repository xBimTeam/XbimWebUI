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
     *
     */
    constructor(guid: string) {
        this.ifc_guid = guid;
        this.originating_system = "xBIM";
        this.authoring_tool_id = "WebUI";
    }
}