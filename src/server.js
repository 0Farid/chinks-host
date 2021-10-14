const express = require('express')
const bodyParser = require('body-parser')
const serveIndex = require('serve-index')
const randomstring = require("randomstring")
const randomColor = require('randomcolor')
const formidable = require('formidable')
const filesizejs = require('filesize')
const fs = require('fs')
const path = require('path')
const app = express()
const getSomeCoolEmojis = require("get-some-cool-emojis")
const bcrypt = require('bcrypt');
var mv = require('mv');
var { nanoid } = require("nanoid");

var mongoUtil = require("./mongoUtil");
mongoUtil.connectToServer()

const Discord = require("discord.js");
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", Discord.Intents.FLAGS.GUILDS] });

client.config = JSON.parse(fs.readFileSync(__dirname + "/data/bot.json"))

const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const oneDay = 1000 * 60 * 60 * 24;

var appDir = path.dirname(require.main.filename).toString().replace("src", "")
var allowedExtensions = ["png", "jpg", "jpeg", "gif", "webm", "mp4", "mov"]

var config = JSON.parse(fs.readFileSync(__dirname + "/data/config.json"))
var uploadKeyLength = config["uploadkeylength"]
var mainDomain = config["maindomain"]

//const users = JSON.parse(fs.readFileSync(__dirname + "/data/users.json"))

var swig  = require('swig');
var cons = require('consolidate');
app.engine('html', cons.swig)
app.set('views', appDir + "public");
app.set('view engine', 'html');

app.use(sessions({
    secret: "secretkey727",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));
var session;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/',(req,res) => {
    session=req.session;
    if(session.userinfo){
        res.redirect("/dashboard")
    }else
    res.sendFile(appDir + "/public/index.html")
});

app.get("/dashboard", (req, res) => {
  if(req.session.userinfo){
    res.render("dashboard.html", {username: req.session.userinfo.username, token:req.session.userinfo.token, inviteurl: `https://${mainDomain}/api/invites/:${req.session.userinfo.username}`})
  }
  else{
    res.redirect("/")
  }
})

app.get("/uploads", (req, res) => {
  if(req.session.userinfo){
    res.render("uploads.html", {uploadurl: `https://${mainDomain}/api/uploads/:${req.session.userinfo.token}`})
  }
  else{
     res.redirect("/")
  }
})

app.get("/signup", (req, res) => {
    res.sendFile(appDir + "/public/signup.html")
})

app.get("/login", (req, res) => {
    res.sendFile(appDir + "/public/login.html")
})


app.post('/signup', async (req, res) => {
    try{
      let foundInvite = await mongoUtil.getInviteModel().findOne({ invite: req.body.invite }).exec()
      if(foundInvite) {
        let foundUser = await mongoUtil.getUserModel().findOne({ username: req.body.username }).exec()
        if (!foundUser) {
    
            let hashPassword = await bcrypt.hash(req.body.password, 10);
            token = `${req.body.username}_${nanoid(10)}`
            
            uid = await mongoUtil.getUserModel().countDocuments({});
            
            let createdUser = {
              username:  req.body.username,
              password: hashPassword,
              token:   token,
              created: Date.now(),
              id: uid,
            }

            mongoUtil.getUserModel().create(createdUser, function (err) {
              console.log(err)
            })
            session = req.session;
            session.userinfo = createdUser;
            console.log(req.session)
            res.redirect('/dashboard')

            await mongoUtil.getInviteModel().findOneAndDelete({ invite: req.body.invite }).exec()
        } else {
            res.send(`
            <html lang="en">
            <head>
                <title>Sign up | chinks.host</title>

                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    
                <link rel="stylesheet" href="assets/login.css">
                <link rel="stylesheet" href="https://use.typekit.net/obf6rgz.css">        
            </head>
            <body align='center'>
              <div class="card">
                <h4>Sign up</h4>
                <form action="/signup" method="POST">
                <fieldset>
                  <div class="input-container">
                    <input type ="text" id = 'username' name="username" placeholder="Username" value="${req.body.username}" required>
                    <div class="bar"></div>
                  </div>
                  <div class="error-message">Username is already taken.</div>
                  <style>
                    .error-message {
                      position: absolute;
                      left: 0;
                      right: 0;
                      margin: auto;
                      color: #ff4a4a;
                      display: inline-block;
                      font-size: 12px;
                      line-height: 15px;
                      margin: 0;
                    }
                  </style>
                  <div class="input-container">
                    <input type="password" id = "password" name="password" placeholder="Password" value="${req.body.password}" required>
                    <div class="bar"></div>
                  </div>

                  <div class="input-container">
                    <input type="invite" id = "invite" name="invite" placeholder="Invite" value="${req.body.invite}" required>
                    <div class="bar"></div>
                  </div>
                  
                  <div class="button-container">
                    <button type ="submit"><span>Submit</span></button>
                  </div>
                </fieldset>
              </form>
              <p>already have an account?</p><a id="mylink" href="/login">login</a>
              </div>
            </body>
          </html>
          `);
        }
      }
      else{
        res.send(`
        <html lang="en">
        <head>
            <title>Sign up | chinks.host</title>

            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                
            <link rel="stylesheet" href="assets/login.css">
            <link rel="stylesheet" href="https://use.typekit.net/obf6rgz.css">        
        </head>
        <body align='center'>
          <div class="card">
            <h4>Sign up</h4>
            <form action="/signup" method="POST">
            <fieldset>
              <div class="input-container">
                    <input type ="text" id = 'username' name="username" placeholder="Username" value="${req.body.username}" required>
                    <div class="bar"></div>
                  </div>
                  <div class="error-message">Username is already taken.</div>
                  <style>
                    .error-message {
                      position: absolute;
                      left: 0;
                      right: 0;
                      margin: auto;
                      color: #ff4a4a;
                      display: inline-block;
                      font-size: 12px;
                      line-height: 15px;
                      margin: 0;
                    }
                  </style>
              <div class="input-container">
                <input type="password" id = "password" name="password" placeholder="Password" value="${req.body.password}" required>
                <div class="bar"></div>
              </div>

              <div class="input-container">
                <input type="invite" id = "invite" name="invite" placeholder="Invite" value="${req.body.invite}" required>
                <div class="bar"></div>
              </div>
              
              <div class="button-container">
                <button type ="submit"><span>Submit</span></button>
              </div>
            </fieldset>
          </form>
          <p>already have an account?</p><a id="mylink" href="/login">login</a>
          </div>
        </body>
        </html>
        `);
      }
    } catch(err){
        res.send("Internal server error:" + err);
    }
});


app.post('/login', async (req, res) => {
  var errormsg = `
  <html lang="en">
      <head>
          <title>Login | chinks.host</title>

          <meta name="viewport" content="width=device-width, initial-scale=1.0">
              
          <link rel="stylesheet" href="assets/login.css">
          <link rel="stylesheet" href="https://use.typekit.net/obf6rgz.css">        
      </head>
      <body align='center'>
        <div class="card">
          <h4>Login</h4>
          <form action="/login" method="POST">
        <fieldset>
          <div class="input-container">
            <input type ="username" id = 'username' name="username" value="${req.body.username}" "placeholder="Username" required/>
            <div class="bar"></div>
            <div class="error-message">Invalid username or password.</div>
          <style>
            .error-message {
              position: absolute;
              left: 0;
              right: 0;
              margin: auto;
              color: #ff4a4a;
              display: inline-block;
              font-size: 12px;
              line-height: 15px;
              margin: 0;
            }
          </style>
          </div>
          
          <div class="input-container">
            <input type="password" id = "password" name="password" placeholder="Password" value="${req.body.password}" required/></input>
            <div class="bar"></div>
          </div>
          <div class="button-container">
            <button type ="submit"><span>Submit</span></button>
          </div>
        </fieldset>
          </form>
          <p>don't have an account?</p><a id="mylink" href="/signup">sign up</a>
        </div>
      </body>
  </html>
  `
  try{
      let foundUser = await mongoUtil.getUserModel().findOne({ username: req.body.username }).exec()
      if (foundUser) {
  
          let submittedPass = req.body.password; 
          let storedPass = foundUser.password; 
  
          const passwordMatch = await bcrypt.compare(submittedPass,storedPass);
          if (passwordMatch) {
            session = req.session;
            session.userinfo = foundUser;
            console.log(req.session)
            res.redirect('/dashboard')
          } else {
              res.send(errormsg);
          }
      }
      else {
  
          let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
          await bcrypt.compare(req.body.password, fakePass);
  
          res.send(errormsg);
      }
  } catch(e){
    console.log(e)
      res.send(`Internal server error: ${e}`);
  }
});

app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});


app.get("/:file", (req, res) => {
    var file = req.params["file"]
    
    fs.readdirSync(__dirname + '/raw/').forEach( function (item, index) {
        if (file == item.replace("." + item.split(".")[1], "")) {
            var filePath = 'raw/' + item
            var fileUrl = "https://"+mainDomain+"/raw/" + item
            var fileSize = filesizejs(fs.statSync(__dirname + "/" + filePath).size, {base: 10})
            var extension = item.split(".")[1]

            mongoUtil.getImageModel().findOne({ filename: item}, (err, upload) => {
              if(!upload){
                console.log("wtf")
                return
              }
              var user = upload.user
              var date = new Date(upload.date).toLocaleDateString()

              var oEmbed = upload.oembed

              /*Placeholders: {filename}, {filesize}, {username}, {uid}, {date}, {randomemoji}*/
              
              var embedTitle = upload.embed.title.replace("{filename}", file).replace("{filesize}", fileSize).replace("{username}", user).replace("{date", date).replace("{randomemoji}", getSomeCoolEmojis(1))

              var embedDescription = upload.embed.description.replace("{filename}", file).replace("{filesize}", fileSize).replace("{username}", user).replace("{date", date).replace("{randomemoji}", getSomeCoolEmojis(1))

              var embedColour = upload.embed.colour

              if (extension == "webm" || extension == "mp4" || extension == "mov") {
                res.send(`<!DOCTYPE html> <html lang="en"> <head> <title>${mainDomain} — ${file}</title> <link type="application/json+oembed" href="${oEmbed}"> <meta name="twitter:card" content="player"> <meta name="twitter:player" content="${fileUrl}"> <meta name="twitter:player:width" content="1280"> <meta name="twitter:player:height" content="720"> <meta name="twitter:title" content="${embedTitle}"> <meta name="twitter:description" content="${embedDescription}"> <meta name="theme-color" content="${embedColour}"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <link rel="stylesheet" href="assets/style.css"> <link rel="stylesheet" href="https://use.typekit.net/obf6rgz.css"> </head> <body> <div class="center"> <div class="card"> <div class="card-content"> <h2 class="card-title">${item} (${fileSize})</h2> <video style="background-color: #14151a; max-width: 100%; height: auto; border-radius: 10px; text-align: center" controls> <source src="${filePath}"> </video> </div></div></div></body> </html>`)
              } else {
                  res.send(`<!DOCTYPE html> <html lang="en"> <head> <title>${mainDomain} — ${file}</title> <link type="application/json+oembed" href="${oEmbed}"> <meta name="twitter:card" content="photo"> <meta name="twitter:image" content="${fileUrl}"> <meta name="twitter:title" content="${embedTitle}"> <meta name="twitter:description" content="${embedDescription}"> <meta name="theme-color" content="${embedColour}"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <link rel="stylesheet" href="assets/style.css"> <link rel="stylesheet" href="https://use.typekit.net/obf6rgz.css"> </head> <body> <div class="center"> <div class="card"> <div class="card-content"> <h2 class="card-title">${item} (${fileSize})</h2> <img src="${filePath}" style=" background-color: #14151a max-width: 100%; height: auto; border-radius: 10px; text-align: center;"> </div></div></div></body> </html> `)                        
              }

            })
        }
    })
})


app.get("/raw/:file", (req, res) => {
  var file = req.params["file"]
  fs.readdirSync(__dirname + '/raw/').forEach( function (item, index) {
      if (file == item) {
          var filePath = __dirname + '/raw/' + item
          res.sendFile(filePath)
      }
  })
})

app.post('/upload', function(req, res) {
  var domains = JSON.parse(fs.readFileSync(__dirname + "/data/domains.json"))
  var form = new formidable.IncomingForm()
  form.parse(req, function (err, fields, files) {
    console.log(files)
    var uploadKey = fields["upload-key"]
    var user = uploadKey.substring(0, uploadKey.length - (uploadKeyLength + 1))
    var embedAuthor = fields["embed-author"]
    var embedTitle = fields["embed-title"]
    var embedDescription = fields["embed-description"]
    var embedColour = fields["embed-colour"]
    var randomColour = randomColor()
    var subdomain = fields["subdomain"]

    if (embedColour.toLowerCase() == "random") {embedColour = randomColour}
    if (embedTitle == null || embedTitle == "") {embedTitle = " "}
    if (embedDescription == null || embedDescription == "") {embedDescription = " "}
    if (embedColour == null || embedColour == "") {embedColour = "#ff0000"}
    if (subdomain == undefined) {subdomain = ""}

    var hash = randomstring.generate(8)
    var extension = path.extname(files.file.name).replace(".", "")

    var dateformatted = new Date(Date.now()).toLocaleDateString()
    embedAuthor = embedAuthor.replace("{filename}", `${hash}.${extension}`).replace("{username}", user).replace("{date", dateformatted).replace("{randomemoji}", getSomeCoolEmojis(1))
    
    mongoUtil.getUserModel().distinct('token', (err, uploadKeys) => {
      if (uploadKeys.includes(uploadKey)) {
      if (allowedExtensions.includes(extension)) {
        mv(files.file.path, `${__dirname}/raw/${hash}.${extension}`, function(err) {
          //if (err) throw err

          fs.writeFileSync(__dirname + "/raw/" + hash + "-embed.json", `{"version":"1.0","type":"link","author_name":"${embedAuthor}"}`)

          mongoUtil.getImageModel().create({
            filename: `${hash}.${extension}`, 
            user: user, 
            url: `https://${mainDomain}/${hash}`,
            oembed: `https://${mainDomain}/raw/${hash}-embed.json`,
            date: Date.now(),
            embed: {
              title: embedTitle,
              description: embedDescription,
              colour: embedColour
            }
          })
       

          if (domains.includes(fields["domain"])) {
              if (subdomain != "") {
                  res.write(`https://${subdomain}.${fields["domain"]}/${hash}`)
              } else {
                  res.write(`https://${fields["domain"]}/${hash}`)
              }
          } else {
              if (subdomain != "") {
                  res.write(`https://${subdomain}.${mainDomain}/${hash}`)
              } else {
                  res.write(`https://${mainDomain}/${hash}`)
              }
          }
          res.end()
        })
      } else {
          res.write("Can't upload that file.")
          res.end()
      }
  } else {
      res.write("Invalid upload key.")
      res.end()
  }
    })
  })

});


app.get("/api/domains", (request, response) => {
    var domains = JSON.parse(fs.readFileSync(__dirname + "/data/domains.json"))
    response.json(domains)
})

app.get("/api/uploads/:uploadkey", (req, res) => {
    var user = req.params["uploadkey"].substring(0, req.params["uploadkey"].length - (uploadKeyLength + 1)).substring(1)
    mongoUtil.getImageModel().find({ user: user}, (err, uploads) => {
      if(err) console.log(err)
      res.json(uploads)
    })
})

app.get("/api/invites/:user", (req, res) => {
    var user = req.params["user"].substring(1)
    mongoUtil.getInviteModel().find({ user: user}, (err, uploads) => {
      if(err) console.log(err)
      res.json(uploads)
    })
})


//DISCORD-----------------------------------------------------------
client.commands = new Discord.Collection();
//const discordCommands = fs.readdirSync(__dirname + '/bot/commands/discord').filter(file => file.endsWith('.js'));
const websiteCommands = fs.readdirSync(__dirname + '/bot/commands/website').filter(file => file.endsWith('.js'));
const ownerCommands = fs.readdirSync(__dirname + '/bot/commands/owner').filter(file => file.endsWith('.js'));


/*for (const file of discordCommands) {
    const command = require(__dirname + `/bot/commands/discord/${file}`);
    client.commands.set(command.name, command); 
}
*/
for (const file of websiteCommands) {
    const command = require(__dirname + `/bot/commands/website/${file}`);
    client.commands.set(command.name, command);
}
for (const file of ownerCommands) {
    const command = require(__dirname + `/bot/commands/owner/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
	console.log("Bot online.")
	client.user.setActivity(`screenshots on chink.host`, {type: `WATCHING`})
});

client.on("messageCreate", message => {
	
	if(message.channel.type === 'dm') return;
	let prefix = client.config.prefix;

	var msg = message.content;

	if(msg.startsWith(`<@!${client.user.id}> `)){
		msg = msg.replace(`<@!${client.user.id}> `, prefix);
	}
	

	if(!msg.startsWith(prefix) || message.author.bot) return;

	const args = msg.slice(prefix.length).split(/ +/);
	if(args == "") return;
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
			|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	try {
			command.execute(message, args, client, prefix);
			
	} catch(error) {
			if(error = "TypeError: Cannot read property \'execute\' of null"){
				console.log(error)
			}
			else {
				console.error(error);
				const errorEmbed = new Discord.MessageEmbed()
					.setColor(client.config.errorcolour)
					.setTitle(`🚫 There was an error running ${message}`)
					.setDescription(error)
				message.channel.send(errorEmbed);
			}
	}
});


app.listen(config["nodeserverport"], () => {
    console.log("listening on :"+config["nodeserverport"])
})

app.use(express.static(appDir + "/public/"))
app.use('assets/', serveIndex(appDir + '/assets/'))

client.login("TOKEN HERE");
