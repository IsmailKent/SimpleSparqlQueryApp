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
const path = require('path');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// in latest body-parser use like below.
app.use(bodyParser.urlencoded({ extended: true }));


const firstQuery = "prefix owl: <http://www.w3.org/2002/07/owl#> prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT  ?subject WHERE { ?subject rdf:type owl:Class}"

let resultsArr=[];
app.get('/', (req, res) => {

    client.query(firstQuery).execute((error, results) => {
        if (!error) {
            resultsArr=[];
            for (var i=0;i<results.results.bindings.length;i++){
                let result = results.results.bindings[i];
                resultsArr.push({
                    result: result,
                    cleanResult : path.basename(result.subject.value)

                });
            }
     
            res.render('layouts/index', {
                results : resultsArr
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
            let preAndObj = [];
            for (var i =0;i<results.results.bindings.length;i++){
                preAndObj.push({
                    predicate: path.basename(results.results.bindings[i].predicate.value),
                    object: path.basename(results.results.bindings[i].object.value)
                });
            }
            res.render('layouts/index', {
                subject: path.basename(subject),
                results: resultsArr,
                preAndObj
            });
        }
        else {
            res.status(400);
        }
    });
    

});


app.listen(Port, () => console.log(`server started on Port ${Port}`));
