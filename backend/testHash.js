const bcrypt = require("bcryptjs");

async function testHash() {
  const password = "Aa1234567";
  const hash = await bcrypt.hash(password, 10);
  console.log("Yeni Hash:", hash);

  const isMatch = await bcrypt.compare(password, hash);
  console.log("Karşılaştırma Sonucu:", isMatch);
}

testHash();
