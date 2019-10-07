//setting up backend
const express = require('express');
const app = express();
const Port = process.env.PORT || 5000;

//setting up interactive part
const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({ defaultLayout: 'index' }));
app.set('view engine', 'handlebars');
//setting up sparql server
var SparqlClient = require('sparql-client');
var util = require('util');
let endpoint = 'http://localhost:3030/dataset/query';
let client = new SparqlClient(endpoint);

// to get data on button click
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));


const firstQuery = "prefix owl: <http://www.w3.org/2002/07/owl#> prefix rdfsyntax: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT  ?subject WHERE { ?subject rdfsyntax:type owl:Class}"
let arr=null;
app.get('/', (req, res) => {

    client.query(firstQuery).execute((error, results) => {
        if (!error) {
            arr = results.results.bindings;

            res.render('layouts/index', {
                results: arr
            });
 
        }
        else {
            res.status(400);
        }
    });

    


});

app.post('/', (req,res)=> {
    let subject = req.body['name'];
    client.query(`Select ?predicate ?object WHERE { <${subject}> ?predicate ?object }`).execute((error, results) => {
        if (!error) {
            res.render('layouts/index', {
                subject,
                results: arr,
                preAndObj: results.results.bindings
            });
        }
        else {
            res.status(400);
        }
    });
    

});


app.listen(Port, () => console.log(`server started on Port ${Port}`));
