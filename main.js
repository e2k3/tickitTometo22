/**
 * 
 * Simple Tickets System - Made by Lyex
 * Lyex (c) 2019
 * 
 */ 

const { Client, Collection }            = require("discord.js");
const client                            = new Client();

client.commands = new Collection();
client.aliases = new Collection();

var walk = require('walk');
var options = { filters: ['archieve'] };
let walker = walk.walk("./commands", options);

walker.on("file", function (root, fileStats, next) {
    if(fileStats.name.split(".")[1] !== "js") return; 
    let cmd = require(`${root}/${fileStats.name}`);
    client.commands.set(cmd.config.name, cmd);
    cmd.config.aliases.forEach(alias => client.aliases.set(alias, cmd.config.name));
    console.log(`[LOADED] ${cmd.config.name.replace(".js", "")} Command.`);
    next();
});
walker.on("end", function () { console.log("Loaded all commands!"); });

const storage   = require("./storage");
const functions = require("./util/functions");
const prefixes  = storage.bot.prefix;
let prefix      = null;

client.login(storage.bot.token);

client.on("message", async msg => {
  if(msg.author.bot || !msg.guild) return; // إذا الي رسل الرسالة بوت او مافيه سيرفر إرجع..
  
  // معرفة البريفكس الذي تم أستخدامة.. 
  for(let pref of prefixes) { if(msg.content.startsWith(pref)) prefix = pref; };
  if(!prefix) return;
  if(!msg.content.toLowerCase().startsWith(prefix)) return;
  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  let cmd;
  if(client.commands.has(command)) cmd = client.commands.get(command);
  else if(client.aliases.has(command)) cmd = client.commands.get(client.aliases.get(command));

  let perms = functions.getPerms(msg); // نجلب صلاحيات العضو الذي كتب الأمر.. الصلاحيات حاليا م لها فائدة لكن بنستعملها بالتحديثات القادمة لو فيه تفاعل للبوت
  if(cmd && perms >= cmd.config.permission) cmd.exec(client, msg, args, storage, perms);
});

client.on("ready", () => { 
    console.log(`==============================================================`);
    console.log(`* ${client.user.tag} is ready!\n`);
    console.log(`* ALL COMMANDS LOADED`);;
    console.log(`* PREFIXES: " ${prefixes.join(", ")} "\n`);
    console.log(`---[ Info ]---`)
    console.log(`Made by: Lyex#8372 (https://gitlab.com/Lyex/simple-tickets-system/)`);
    console.log("---------------")
    console.log(`==============================================================`);
});