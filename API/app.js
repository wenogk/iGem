// in sublime
var express = require("express");
var port = process.env.PORT || 3000;
var app = express();
var bodyParser = require('body-parser')
const API_KEY = "1234";
const API_DECRYPTION_KEY = "njd3o8d98hiu3eh98hd9duyv20";
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
	//DATABASE CONNECTION

			const { Pool } = require('pg');
			const pool = new Pool({
			  connectionString: process.env.DATABASE_URL,
			  ssl: true
			});
	
	//END DATABASE CONNECTION

	//ENCRYPTION ALGORITHMS FOR PASSPORT NUMBER

			var crypto = require('crypto'),
			    algorithm = 'aes-256-ctr',
			    password = API_DECRYPTION_KEY;

			function encrypt(text){
			  var cipher = crypto.createCipher(algorithm,password)
			  var crypted = cipher.update(text,'utf8','hex')
			  crypted += cipher.final('hex');
			  return crypted;
			}
			 
			function decrypt(text){
			  var decipher = crypto.createDecipher(algorithm,password)
			  var dec = decipher.update(text,'hex','utf8')
			  dec += decipher.final('utf8');
			  return dec;
			}

	//END ENCRYPTION ALGORITHMS FOR PASSPORT NUMBER




const getTestValues = (req,res) => {
	pool.query("select * from test_table",(error,results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	});
}

const getTestById = (req,res) => {
	const id = parseInt(req.params.id);
	pool.query('select * from test_table where id =$1',[id],(error,results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	});
}

const createTest = (req, res) => {
	const idVal= parseInt(req.body.id);
	const nameVal = req.body.name;
  pool.query(`INSERT INTO test_table (id, name) VALUES ('${idVal}', '${nameVal}')`, (error, results) => {
    if (error) {
      throw error
    }
    res.status(201).send(`Record added with ID: ${idVal}`)
  }) 
}

const updateTest = (req, res) => {
	const idVal= parseInt(req.params.id);
	const nameVal = req.body.name;
  pool.query(`UPDATE test_table SET name='${nameVal}' WHERE id=${idVal}`, (error, results) => {
    if (error) {
      throw error
    }
    res.status(201).send(`Record modified with Name: ${nameVal}`)
  }) 
}

const deleteTest = (req, res) => {
	const idVal= parseInt(req.params.id);
  pool.query(`DELETE FROM test_table WHERE id=${idVal}`, (error, results) => {
    if (error) {
      throw error
    }
    res.status(201).send(`Record deleted with ID: ${idVal}`)
  }) 
}

app.get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.send(results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  });

//START DISEASE API
const getAllDiseaseData = (req,res) => {

	pool.query("select * from diseaseDatabase",(error,results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	});
}

const getAllDiseaseDataByDisease = (req,res) => {
	let queryString = "";
	switch(req.params.disease) {
		case "malaria":
		queryString=`select * from diseaseDatabase WHERE Malaria>0`;
		break;

		case "hepatitisB":
		queryString=`select * from diseaseDatabase WHERE HepatitisB>0`;
		break;

		case "whoopingCough":
		queryString=`select * from diseaseDatabase WHERE WhoopingCough>0`;
		break;

		case "tuberculosis":
		queryString=`select * from diseaseDatabase WHERE Tuberculosis>0`;
		break;

	}

if(queryString!="") {
	pool.query(queryString,(error,results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	});

} else {
	res.status(200).send("Error: Use one of the following: malaria,hepatitisB,whoopingCough,tuberculosis");
}
}
const getAllDiseaseDataByNationality = (req,res) => {
	pool.query(`select * from diseaseDatabase WHERE nationality='${req.params.nationality}'`,(error,results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	});
}

const getAllDiseaseDataByAirportCode = (req,res) => {
	pool.query(`select * from diseaseDatabase WHERE airportCode='${req.params.airportCode}'`,(error,results) => {
		if(error) {
			throw error;
		}
		res.status(200).json(results.rows);
	});
}

const addNewRecord = (req, res) => {
		let dataFilled=true;
	let dataFilledError = "Error: These variables have not been sent: ";
	if(undefined==req.body.identifier) {
		dataFilled=false;
		dataFilledError+="identifier,";
	}
	if(undefined==req.body.airportCode) {
		dataFilled=false;
		dataFilledError+="airportCode,";
	}
	if(undefined==req.body.hepatitisB) {
		dataFilled=false;
		dataFilledError+="hepatitisB,";
	}
	if(undefined==req.body.whoopingCough) {
		dataFilled=false;
		dataFilledError+="whoopingCough,";
	}
	if(undefined==req.body.tuberculosis) {
		dataFilled=false;
		dataFilledError+="tuberculosis,";
	}
	if(undefined==req.body.plague) {
		dataFilled=false;
		dataFilledError+="plague,";
	}
	if(undefined==req.body.nationality) {
		dataFilled=false;
		dataFilledError+="nationality,";
	}
	if(undefined==req.body.fromAirportCode) {
		dataFilled=false;
		dataFilledError+="fromAirportCode,";
	}
		if(undefined==req.body.toAirportCode) {
		dataFilled=false;
		dataFilledError+="toAirportCode,";
	}
    let idVal = encrypt(req.body.identifier);

	let time=Date.now();
	let airportCodeVal = req.body.airportCode;
	let malaria = parseInt(req.body.malaria);
	let hepatitisB = parseInt(req.body.hepatitisB);
	let whoopingCough = parseInt(req.body.whoopingCough);
	let tb = parseInt(req.body.tuberculosis);
	let plague = parseInt(req.body.plague); 
	let nationality = req.body.nationality; 
	let fromAirportCode = req.body.fromAirportCode;
	let toAirportCode = req.body.toAirportCode;
	let correctAPIKEY = (req.body.apikey==API_KEY);
	//console.log("nationality VAL IS: " + nationality)

	//res.status(200).send("airportCodeVal: " + airportCodeVal );
	if(correctAPIKEY){
				if(dataFilled) {
		  	pool.query(`insert into diseaseDatabase (identifier, time, airportCode, Malaria, HepatitisB, WhoopingCough, Tuberculosis, Plague, nationality,fromAirportCode,toAirportCode) values ('${idVal}', '${time}','${airportCodeVal}','${malaria}','${hepatitisB}','${whoopingCough}','${tb}','${plague}','${nationality}','${fromAirportCode}','${toAirportCode}')`, (error, results) => {
		    if (error) {
		      throw error
		    }
		    res.status(201).send(`Record added successfully.`)
		  	}) 
			}	else {
			res.status(201).send(dataFilledError);
				}
	 } else {
  		res.status(201).send(`Incorrect API key.`)
  }
}

const updateRecord = (req, res) => {
	let dataFilled=true;
	let dataFilledError = "Error: These variables have not been sent: ";
	if(undefined==req.params.identifier) {
		dataFilled=false;
		dataFilledError+="identifier,";
	}
	if(undefined==req.body.airportCode) {
		dataFilled=false;
		dataFilledError+="airportCode,";
	}
	if(undefined==req.body.hepatitisB) {
		dataFilled=false;
		dataFilledError+="hepatitisB,";
	}
	if(undefined==req.body.whoopingCough) {
		dataFilled=false;
		dataFilledError+="whoopingCough,";
	}
	if(undefined==req.body.tuberculosis) {
		dataFilled=false;
		dataFilledError+="tuberculosis,";
	}
	if(undefined==req.body.plague) {
		dataFilled=false;
		dataFilledError+="plague,";
	}
	if(undefined==req.body.nationality) {
		dataFilled=false;
		dataFilledError+="nationality,";
	}
	if(undefined==req.body.fromAirportCode) {
		dataFilled=false;
		dataFilledError+="fromAirportCode,";
	}
		if(undefined==req.body.toAirportCode) {
		dataFilled=false;
		dataFilledError+="toAirportCode,";
	}


	let idVal= req.params.identifier; //md5 hash this here  id
	let time=Date.now();
	let airportCodeVal = req.body.airportCode;
	let malaria = parseInt(req.body.malaria);
	let hepatitisB = parseInt(req.body.hepatitisB);
	let whoopingCough = parseInt(req.body.whoopingCough);
	let tb = parseInt(req.body.tuberculosis);
	let plague = parseInt(req.body.plague); 
	let nationality = req.body.nationality; 
	let fromAirportCode = req.body.fromAirportCode;
	let toAirportCode = req.body.toAirportCode;
	console.log(`UPDATE diseaseDatabase SET identifier='${idVal}', time='${time}', airportCode='${airportCodeVal}', Malaria='${malaria}', HepatitisB='${hepatitisB}', WhoopingCough='${whoopingCough}', Tuberculosis='${tb}', Plague='${plague}', nationality='${nationality}',fromAirportCode='${fromAirportCode}',toAirportCode='${toAirportCode}' WHERE identifier='${idVal}'`);
  pool.query(`UPDATE diseaseDatabase SET identifier='${idVal}', time='${time}', airportCode='${airportCodeVal}', Malaria='${malaria}', HepatitisB='${hepatitisB}', WhoopingCough='${whoopingCough}', Tuberculosis='${tb}', Plague='${plague}', nationality='${nationality}',fromAirportCode='${fromAirportCode}',toAirportCode='${toAirportCode}' WHERE identifier='${idVal}'`, (error, results) => {
    if (error) {
      throw error
    }
    res.status(201).send(`Record modified successfully.`)
  }) 
}
const deleteRecord = (req, res) => {
	let idVal= req.params.id;
  pool.query(`DELETE FROM diseaseDatabase WHERE identifier='${idVal}'`, (error, results) => {
    if (error) {
      throw error
    }
    res.status(201).send(`Record deleted with ID: ${idVal}`)
  }) 
}
//END DISEASE API FUNTIONS
app.get('/test', getTestValues); //get all records
app.get('/test/:id', getTestById); //get records with a specific id
app.post('/test', createTest); // create new record
app.put('/test/:id', updateTest); //update a record
app.delete('/test/:id', deleteTest); //delete a record


app.listen(port, function () {
 console.log("Example app listening on port !");
});

app.get('/request',getAllDiseaseData);
app.get('/request/by/disease/:disease',getAllDiseaseDataByDisease);
app.get('/request/by/nationality/:nationality',getAllDiseaseDataByNationality)
app.get('/request/by/airportCode/:airportCode',getAllDiseaseDataByAirportCode)
//app.put('/request/:identifier',updateRecord);
app.post('/request',addNewRecord);
app.delete('/request/:id',deleteRecord);
