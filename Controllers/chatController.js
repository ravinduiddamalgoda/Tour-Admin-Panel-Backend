const connection = require('../Config/db');


const getChatByInquiry = (req, res) => {
    const inquiryID = req.params.InquiryID;
    
    const query = `
        SELECT cm.MessageID, cm.ChatSessionID, cm.SenderID, cm.Message, cm.Type , cm.SentDate, u.FirstName, u.LastName, u.Email 
        FROM ChatMessage cm
        JOIN ChatSession cs ON cm.ChatSessionID = cs.ChatSessionID
        JOIN User u ON cm.SenderID = u.UserID
        WHERE cs.InquiryID = ?
        ORDER BY cm.SentDate ASC, cm.MessageID ASC
    `;
    
    connection.query(query, [inquiryID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(rows);
        // console.log(rows)
    });
};

const sendMessageByInquiry = (req, res) => {
    const { InquiryID } = req.params;
    const { SenderID, Message } = req.body;
    // const file = req.file ? req.file.path : '';
    // let mainMessage = Message;
    // let type = "message";
    // if(file === ''){
    //     console.log("no file");
    // }else{
    //     mainMessage =  file;
    //     type = "file";
    // }
    const getChatSessionQuery = `
        SELECT ChatSessionID FROM ChatSession WHERE InquiryID = ? AND Status = 'Active'
    `;

    connection.query(getChatSessionQuery, [InquiryID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return res.status(500).send('Internal Server Error');
        } 

        if (rows.length === 0) {
            return res.status(404).send('Chat session not found for the given inquiry');
        }

        const chatSessionID = rows[0].ChatSessionID;

        const insertMessageQuery = `
            INSERT INTO ChatMessage (ChatSessionID, SenderID, Message)
            VALUES (?, ?, ?)
        `;

        connection.query(insertMessageQuery, [chatSessionID, SenderID, Message], (err, result) => {
            if (err) {
                console.error('Error inserting message into MySQL database:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(201).json({ message: 'Message sent successfully', messageID: result.insertId });
        });
    });
};


const sendFileByInquiry = (req, res) => {
    const { InquiryID } = req.params;
    const { SenderID } = req.body;
    const file = req.file ? req.file.path : '';
    const type = "file";

    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    const getChatSessionQuery = `
        SELECT ChatSessionID FROM ChatSession WHERE InquiryID = ? AND Status = 'Active'
    `;

    connection.query(getChatSessionQuery, [InquiryID], (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (rows.length === 0) {
            return res.status(404).send('Chat session not found for the given inquiry');
        }

        const chatSessionID = rows[0].ChatSessionID;

        const insertMessageQuery = `
            INSERT INTO ChatMessage (ChatSessionID, SenderID, Message, Type)
            VALUES (?, ?, ?, ?)
        `;

        connection.query(insertMessageQuery, [chatSessionID, SenderID, file, type], (err, result) => {
            if (err) {
                console.error('Error inserting message into MySQL database:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(201).json({ message: 'Message sent successfully', messageID: result.insertId });
        });
    });
};



module.exports = {
    getChatByInquiry,
    sendMessageByInquiry,
    sendFileByInquiry
};  
