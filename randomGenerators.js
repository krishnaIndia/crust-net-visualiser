const crypto = require('crypto');
var startIpRange = "97.238.241.11";
var endIpRange = "97.238.241.30";

var operationSystems = [
    "linux",
    "macos",
    "windows"
];

var natTypes = [
    "EDM",
    "EIM"
];

const randomOS = () => {
    return operationSystems[Math.floor(Math.random() * operationSystems.length)];
}

const randomNatType = () => {
    return natTypes[Math.floor(Math.random() * natTypes.length)];
}

const randomIP = (startIp = startIpRange, endIp = endIpRange) => {
    const startIpNum = Number(startIp.split(".").map((num) => (`000${num}`).slice(-3)).join(""));
    const endIpNum = Number(endIp.split(".").map((num) => (`000${num}`).slice(-3)).join(""));
    var endBit = startIp.split(".")[3];
    return startIp.replace(endBit, parseInt(endBit) + (Math.floor(Math.random() * (endIpNum - startIpNum)) + 1));
}

const randomId = () => {
    const buf = new Buffer(32);
    crypto.randomFillSync(buf);
    return [...buf];
}

const randomBoolean = () => {
    return Math.random() >= 0.5;
}

const randomFailSucceed = () => {
    return Math.random() >= 0.5 ? "Failed" : "Succeeded";
}

var names1 = ["Jackson", "Aiden", "Liam", "Lucas", "Noah", "Mason", "Jayden", "Ethan", "Jacob", "Jack", "Caden", "Logan", "Benjamin", "Michael", "Caleb", "Ryan", "Alexander", "Elijah", "James", "William", "Oliver", "Connor", "Matthew", "Daniel", "Luke", "Brayden", "Jayce", "Henry", "Carter", "Dylan", "Gabriel", "Joshua", "Nicholas", "Isaac", "Owen", "Nathan", "Grayson", "Eli", "Landon", "Andrew", "Max", "Samuel", "Gavin", "Wyatt", "Christian", "Hunter", "Cameron", "Evan", "Charlie", "David", "Sebastian", "Joseph", "Dominic", "Anthony", "Colton", "John", "Tyler", "Zachary", "Thomas", "Julian", "Levi", "Adam", "Isaiah", "Alex", "Aaron", "Parker", "Cooper", "Miles", "Chase", "Muhammad", "Christopher", "Blake", "Austin", "Jordan", "Leo", "Jonathan", "Adrian", "Colin", "Hudson", "Ian", "Xavier", "Camden", "Tristan", "Carson", "Jason", "Nolan", "Riley", "Lincoln", "Brody", "Bentley", "Nathaniel", "Josiah", "Declan", "Jake", "Asher", "Jeremiah", "Cole", "Mateo", "Micah", "Elliot"]
var names2 = ["Sophia", "Emma", "Olivia", "Isabella", "Mia", "Ava", "Lily", "Zoe", "Emily", "Chloe", "Layla", "Madison", "Madelyn", "Abigail", "Aubrey", "Charlotte", "Amelia", "Ella", "Kaylee", "Avery", "Aaliyah", "Hailey", "Hannah", "Addison", "Riley", "Harper", "Aria", "Arianna", "Mackenzie", "Lila", "Evelyn", "Adalyn", "Grace", "Brooklyn", "Ellie", "Anna", "Kaitlyn", "Isabelle", "Sophie", "Scarlett", "Natalie", "Leah", "Sarah", "Nora", "Mila", "Elizabeth", "Lillian", "Kylie", "Audrey", "Lucy", "Maya", "Annabelle", "Makayla", "Gabriella", "Elena", "Victoria", "Claire", "Savannah", "Peyton", "Maria", "Alaina", "Kennedy", "Stella", "Liliana", "Allison", "Samantha", "Keira", "Alyssa", "Reagan", "Molly", "Alexandra", "Violet", "Charlie", "Julia", "Sadie", "Ruby", "Eva", "Alice", "Eliana", "Taylor", "Callie", "Penelope", "Camilla", "Bailey", "Kaelyn", "Alexis", "Kayla", "Katherine", "Sydney", "Lauren", "Jasmine", "London", "Bella", "Adeline", "Caroline", "Vivian", "Juliana", "Gianna", "Skyler", "Jordyn"]

const randomName = () => {
    return names1[Math.floor(Math.random() * names1.length)] + " " + names2[Math.floor(Math.random() * names2.length)];
}

module.exports = {
    randomBoolean,
    randomFailSucceed,
    randomIP,
    randomName,
    randomNatType,
    randomId,
    randomOS
}
