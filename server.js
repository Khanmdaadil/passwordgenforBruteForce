const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/passwordGenerator', { useNewUrlParser: true, useUnifiedTopology: true });

const PasswordListSchema = new mongoose.Schema({
  criteria: String,
  passwords: [String]
});

const PasswordList = mongoose.model('PasswordList', PasswordListSchema);

app.use(express.json());
app.use(express.static('public'));

app.post('/generate', async (req, res) => {
  const { length, useUppercase, useLowercase, useNumbers, useSpecial } = req.body;
  const criteria = JSON.stringify({ length, useUppercase, useLowercase, useNumbers, useSpecial });

  try {
    let passwordList = await PasswordList.findOne({ criteria });

    if (passwordList) {
      console.log('Returning stored result');
      res.json({ passwords: passwordList.passwords });
    } else {
      console.log('Generating new passwords');
      const passwords = generatePasswords(length, useUppercase, useLowercase, useNumbers, useSpecial);
      passwordList = new PasswordList({ criteria, passwords });
      await passwordList.save();
      res.json({ passwords });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

function generatePasswords(length, useUppercase, useLowercase, useNumbers, useSpecial) {
  let chars = '';
  if (useUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (useNumbers) chars += '0123456789';
  if (useSpecial) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const passwords = [];

  function generateAllPasswords(prefix, len) {
    if (len === 0) {
      passwords.push(prefix);
      return;
    }
    for (let i = 0; i < chars.length; i++) {
      generateAllPasswords(prefix + chars[i], len - 1);
    }
  }

  generateAllPasswords('', length);
  return passwords;
}
