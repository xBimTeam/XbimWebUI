/**
 * This is a structure reporting errors and warnings about prerequisites of {@link Viewer Viewer}. It is result of {@link Viewer.checkPrerequisities checkPrerequisities()} static method.
 *
 * @name Prerequisites
 * @class
 */
export class CheckResult {
    /**
    * If this array contains any warnings Viewer will work but it might be slow or may not support full functionality.
    * @member {string[]}  Prerequisites#warnings
    */
    public warnings: string[] = [];
    /**
    * If this array contains any errors Viewer won't work at all or won't work as expected.
    * You can use messages in this array to report problems to user. However, user won't probably
    * be able to do to much with it except trying to use different browser. IE10- are not supported for example.
    * The latest version of IE should be all right.
    * @member {string[]}  Prerequisites#errors
    */
    public errors: string[] = [];
    /**
    * If false Viewer won't work at all or won't work as expected.
    * You can use messages in {@link Prerequisites#errors errors array} to report problems to user. However, user won't probably
    * be able to do to much with it except trying to use different browser. IE10- are not supported for example.
    * The latest version of IE should be all right.
    * @member {string[]}  Prerequisites#noErrors
    */
    public noErrors: boolean = false;
    /**
    * If false Viewer will work but it might be slow or may not support full functionality. Use {@link Prerequisites#warnings warnings array} to report problems.
    * @member {string[]}  Prerequisites#noWarnings
    */
    public noWarnings: boolean = false;
}
