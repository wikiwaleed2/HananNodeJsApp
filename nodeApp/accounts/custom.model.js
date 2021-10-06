const db = require('./../_helpers/db');

 module.exports = class CustomModel {
    
    constructor(employee) {
        this.first_name     = employee.name;
        this.created_at     = new Date();
        this.updated_at     = new Date(); 
    }

   // Getter
    get area() {
        return this.calcArea();
    }
    // Method
    calcArea() {
        return this.height * this.width;
    }

    static getAllEmployees() {
        //# Test query
        db.connection.query("SELECT * FROM tecs").then(([ rows ]) => {
            var result = rows.map(employee => new CustomModel(employee));
            console.log("Response: ", rows);
            console.log(result[0].first_name);
            return result;
        })
        .catch(error => {
            throw error;
        });
        //# 
    }

}


  
  