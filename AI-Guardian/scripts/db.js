const mysql = require('mysql');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 5501;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'ai-guardian.mysql.database.azure.com',
    user:'aiGuard',
    password:'28-fourth-25',
    database:'aiguardian',
    port: 3306,
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
    if(err) {
        console.error("error connecting to the database:",err);
    } else {
        console.log("Connected to db")
    }
    
});




//I ADDED A ROUTE TO HANDLE CHANGES MADE TO SAFE OR UNSAFE FOODS
// Assuming we're using Express and have a db connection set up
app.post('/api/update-status', (req, res) => {
    const { productId, status } = req.body;

    if (!productId || !status) {
        return res.status(400).json({ message: 'Missing productId or status' });
    }

    const query = 'UPDATE purchase_history SET status = ? WHERE product_id = ?';
    db.query(query, [status, productId], (err, result) => {
        if (err) {
            console.error('Error updating status:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        return res.json({ message: 'Status updated successfully' });
    });
});


//CREATE A TABLE USING THIS CODE SO IGNORE
// CREATE TABLE purchase_history (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     user_id INT,
//     product_id VARCHAR(255),
//     product_name VARCHAR(255),
//     date_scanned DATE,
//     status VARCHAR(10)  -- should hold 'safe' or 'unsafe'
// );



app.post('/allergens', (req, res) => {
    const id = req.body;
    const query = 'SELECT allergens FROM users WHERE id = ?'; // Adjust table/column names

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch allergens' });
        }
        res.json(results); // Returns array like [{ allergen_name: "Peanuts" }, ...]
    });
});


app.post('/update-allergens', async (req, res) => {
  const { userId, allergens } = req.body;
  db.query(
    'UPDATE users SET allergens = ? WHERE id = ?',
    [JSON.stringify(allergens), userId],
    (err) => {
      if (err) {
        console.error("Error saving preferences:", err);
        return res.status(500).json({ error: "Failed to save preferences" });
      }
      res.status(200).json({ success: true });
    }
  );
});


// Save user name
app.post('/api/user', (req, res) => {
    const { userId, name } = req.body;
    db.query('UPDATE users SET name = ? WHERE id = ?', [name, userId], (err) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "User name updated" });
    });
  });
  
  // Get user name
  app.get('/api/user/:userId', (req, res) => {
    db.query('SELECT name FROM users WHERE id = ?', [req.params.userId], (err, results) => {
      if (err) return res.status(500).send(err);
      const name = results[0]?.name || "";
      res.send({ name });
    });
  });

  app.post('/reload/user',(req,res) => {
    const {id}= req.body;
    db.query('SELECT * FROM users WHERE id=?',[id] ,(err,results) => {
      if(err) {
        console.error("Error reloading user: " , err);
        return;
      }
      console.log(results[0]);
      res.json(results[0]);
    })
  })

  // Save user allergen preferences
app.post('/change-preferences', (req, res) => {
    const { id, allergens } = req.body;
    const allergensJSON = JSON.stringify(allergens);

    db.query('UPDATE users SET allergens = ? WHERE id = ?', [allergensJSON, id], (err) => {
        if (err) {
            console.error('Error saving preferences:', err);
            return res.status(500).json({ error: 'Failed to save preferences' });
        }
        res.json({ message: 'Preferences saved' });
    });
});

// Get user allergen preferences
app.get('/api/preferences/:userId', (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT allergens FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving preferences:', err);
            return res.status(500).json({ error: 'Failed to load preferences' });
        }

        const prefs = results[0]?.allergens ? JSON.parse(results[0].allergens) : [];
        res.json(prefs);
    });
});





// Save scan history
app.post('/api/scan-history', (req, res) => {
    const { userId, product } = req.body;

    const query = `
        INSERT INTO scanHistory (user_id, product_name, ingredients, date)
        VALUES (?, ?, ?, NOW())
    `;
    db.query(query, [userId, product.name, JSON.stringify(product.ingredients)], (err) => {
        if (err) {
            console.error('Error saving scan history:', err);
            return res.status(500).json({ error: 'Failed to save scan history' });
        }
        res.json({ message: 'Scan saved' });
    });
});

// Get scan history
app.get('/api/scan-history/:userId', (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT product_name, ingredients, date
        FROM scanHistory
        WHERE user_id = ?
        ORDER BY date DESC
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching scan history:', err);
            return res.status(500).json({ error: 'Failed to fetch history' });
        }
        res.json(results);
    });
});




// here i am working on everything to do with OpenAI
app.get('/api/scan-history/:userId/latest', (req, res) => {
    const { userId } = req.params;
    const query = `
      SELECT product_name, ingredients
      FROM scanHistory
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT 1
    `;
  
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching latest scan:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
        return res.json({ product_name: "", ingredients: "" });
      }

      const latest = results[0];
      res.json({
        product_name: latest.product_name,
        ingredients: JSON.parse(latest.ingredients)
      });
    });
  });
  

app.use(express.static(path.join(__dirname,'scripts')));


// FUNCTION FOR CREATING ACCOUNT AND SETTING PASSWORD

const bcrypt = require('bcrypt');

app.post('/api/register', async (req, res) => {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    // Check if username or email already exists
    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: "Database error." });
      }

      if (results.length > 0) {
        return res.status(400).json({ success: false, message: "Username or email already exists." });
      }

      // Hash password
      // const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.query('INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)',
        [name, email, username, password],
        (err) => {
          if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ success: false, message: "Failed to create account." });
          }

          return res.json({ success: true, message: "Account created successfully!" });
        });
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Unexpected error." });
  }
});

  app.post('/loginnormal', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Missing credentials' });
  
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
  
      if (results.length === 0)
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
  
      const user = results[0];
  
      const match = (user.password===password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
  
      // Create a token
      // const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  
      return res.json({ success: true,user});
    });
  });

app.post('/login/phone', (req, res) => {
    const { phone, password } = req.body;
  
    if (!phone || !password)
      return res.status(400).json({ success: false, message: 'Missing credentials' });
  
    db.query('SELECT * FROM users WHERE phone = ?', [phone], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
  
      if (results.length === 0)
        return res.status(401).json({ success: false, message: 'Invalid phone or password' });
  
      const user = results[0];
  
      const match = (user.password===password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
  
      // Create a token
      // const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  
      return res.json({ success: true,user});
    });
  });

  app.post('/login/email', (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Missing credentials' });
  
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
  
      if (results.length === 0)
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
  
      const user = results[0];
  
      const match = (user.password===password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
  
      // Create a token
      // const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  
      return res.json({ success: true,user});
    });
  });



  

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

