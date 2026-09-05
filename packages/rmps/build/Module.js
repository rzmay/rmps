class Module {
    constructor(modify, priority = -1) {
        this.modify = modify;
        this.priority = priority;
        // Sub-modules on which this module depends.
        // Useful for pre-processing or combining priority stages.
        this.dependents = [];
    }
    // Process into array including self and dependents
    withDependents() {
        return [
            this,
            ...(this.dependents.flatMap(d => d.withDependents()))
        ];
    }
    // Optional preparation hook called once-per-update rather than per particle
    prepare(particleSystem, deltaTime) { }
    // Optional clean up hook for modules that require it
    cleanup() { }
}
export default Module;
