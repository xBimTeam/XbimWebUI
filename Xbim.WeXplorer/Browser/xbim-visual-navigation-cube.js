var Student = (function () {
    function Student(firstname, middleinitial, lastname) {
        this.firstname = firstname;
        this.middleinitial = middleinitial;
        this.lastname = lastname;
        this.fullname = firstname + " " + middleinitial + " " + lastname;
        this.name = firstname;
        this.data = new Float32Array(600);
    }
    return Student;
})();

function greeter(person) {
    return "Hello, " + person.firstname + " " + person.lastname;
}

var user = new Student("Jane", "M.", "User");

document.body.innerHTML = greeter(user);
//# sourceMappingURL=xbim-visual-navigation-cube.js.map
