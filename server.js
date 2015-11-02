'use strict'; 
 
 // simple express server 
var http = require('http');
var https = require('https');
var express = require('express');
var request = require('request');
var ch = require('cheerio');  
var fs = require('fs');
var path = require('path');
var app = express(); 
//var router = express.Router(); 
 
app.use(express.static(__dirname + '/')); 

function findInDom(p, table,fieldName)
{
	var header = p("td:contains(" + fieldName+ ")", table).parent();
	var value = header.find("td").last().text();
	return value;
}

app.get('/foo', function(req, res) {
	console.warn("Request with IBAN " + req.query.iban);	
	var iban = req.query.iban; 
	// Get IBAN data..
	request({
		uri: "https://www.ibansamplepage.com/",
		method: "POST",
		form: {
			iban: iban
		}
	},function (error, response, body) {
		if (response.statusCode == 200)
		{
			if (body.indexOf(" is not valid!")!= -1)
			{
				console.warn("Response: INVALID IBAN");
				res.json(
					{
						IsValid:false,
						IBAN: iban
					});
				return;
			}
			else{
				var p = ch.load(body);
				var table = p('div.ibantable table');
				
				var result = 
					{
						IsValid:true,
						IBAN: iban,
						BIC : findInDom(p, table, "BIC"),
						Bank : findInDom(p, table, "BANK"),
						Address : findInDom(p, table, "ADDRESS"),
						City : findInDom(p, table, "CITY"),
						Zip : findInDom(p, table, "ZIP"),
						Country : findInDom(p, table, "COUNTRY"),
						Phone : findInDom(p, table, "PHONE"),
						Fax : findInDom(p, table, "FAX"),
						Email : findInDom(p, table, "EMAIL"),
						Www : findInDom(p, table, "WWW")		
					};
					
				console.warn("Response: VALID IBAN " + result);
				
				res.json(result);
			}
		}
	});
}); 

// SEE https://github.com/coolaj86/node-ssl-root-cas/wiki/Painless-Self-Signed-Certificates-in-node.js
// Use
// set OPENSSL_CONF=C:\OpenSSL-Win64\bin\openssl.cfg
// 
// openssl genrsa -out all/my-private-root-ca.key.pem 2048
// openssl req -x509 -new -nodes -key all/my-private-root-ca.key.pem -days 1024 -out all/my-private-root-ca.crt.pem -subj "/C=AT/ST=NOE/L=Knor/O=Knor Signing Authority/CN=knor.net"
// 
// 
// openssl genrsa -out all/my-server.key.pem 2048
// # Create a request from your Device, which your Root CA will sign
// openssl req -new -key all/my-server.key.pem -out all/my-server.csr.pem -subj "/C=AT/ST=Wien/L=Knor/O=Knor.net/CN=localhost"
// 
// # Sign the request from Device with your Root CA
// openssl x509 -req -in all/my-server.csr.pem -CA all/my-private-root-ca.crt.pem -CAkey all/my-private-root-ca.key.pem -CAcreateserial -out all/my-server.crt.pem -days 500

require('ssl-root-cas').inject()
  .addFile(path.join(__dirname, 'certs', 'my-private-root-ca.crt.pem'));

var options = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'my-server.key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'my-server.crt.pem'))
};

var httpsServer = https.createServer(options, app);

httpsServer.listen(8443);