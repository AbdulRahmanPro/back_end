require('dotenv').config();
const User = require('../module/user'); // تأكد من تحديد المسار الصحيح
const Session = require('../module/session')
const Action = require('../module/action')
const jwt = require('jsonwebtoken');
const key_token ="5AL*6An=p;]4Q!d'5d'vI{2BRO|^@8FI";
const createtoken = (user)=>{
    const token = jwt.sign({ userId: user._id }, key_token, { expiresIn: '24h' });
    return token
}
const login = async (req, res) => {
    try {
        const {username,password} = req.body
        // البحث عن المستخدم بواسطة البريد الإلكتروني أو اسم المستخدم
        const user = await User.findOne({ username: username });
        if (!user) {
            // إرجاع رسالة خطأ محددة إذا لم يتم العثور على المستخدم
            return res.status(400).json({ error: 'The user with the entered email address was not found.' });
        }

        // التحقق من كلمة المرور
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            // إرجاع رسالة خطأ محددة إذا كانت كلمة المرور غير صحيحة
            return res.status(401).json({ error: 'The password is incorrect' });
        }

        // المستخدم مصادق عليه بنجاح
        const token = createtoken(user)
        res.status(200).json({jwt:token});
    } catch (err) {
        // إرجاع رسالة خطأ عامة في حالة حدوث خطأ غير متوقع
        res.status(500).json({ error: 'An error occurred while trying to sign in.' });
    }
};
const register = async (req, res) => {
    try {
        const { username, password, email } = req.body
        const foundemail = await User.findOne({ username: username })
        if (foundemail) {
            return res.status(400).json({ error: "Used email" })
        }
        const newUser = new User({
            username: username,
            email: email,
            password: password,
        })
        await newUser.save();
        const token = createtoken(newUser);
        return res.status(200).json({jwt:token})
    } catch (error) {
        console.log(error)
    }
}
const Access_User = async(req, res) => {
    try {
        const {token} = req.body;
        if (!token) {
            return res.status(400).json({ message: "No token provided", power: false });
        }
        if (!key_token) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        const decoded = jwt.verify(token, key_token);
        // افترض أن هناك بعض البيانات المتوقعة في الرمز
        if (decoded ) {
            return res.status(200).json({ message: "You are an authorized user", power: true });
        } else {
            return res.status(401).json({ message: "Invalid token", power: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "A strange problem has occurred", power: false });
    }
};
const updateSessionStatus = async (req, res) => {
    const { profile_id, token } = req.body;
    try {
        let session = await Session.findOne({ profile_id: profile_id });

        if (session) {
            console.log("Update Session");
            // تحديث الجلسة الموجودة
            await Session.findOneAndUpdate(
                { profile_id: profile_id },
                { isActive: true, token: token }
            );
        } else {
            // إنشاء جلسة جديدة إذا لم توجد
            const newSession = new Session({
                profile_id: profile_id,
                isActive: true,
                token: token
                // يمكنك إضافة أية حقول أخرى هنا إذا لزم الأمر
            });
            await newSession.save();
        }

        // إرسال الاستجابة مرة واحدة فقط بعد تحديث أو إنشاء الجلسة
        res.status(200).json({message: "The session state has been updated"});
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};
const setSessionInactive = async (req, res) => {
    const { profile_id } = req.body;

    try {
        let session = await Session.findOne({ profile_id: profile_id });

        if (session) {
            // تحديث الجلسة الموجودة إلى isActive: false
            await Session.findOneAndUpdate(
                { profile_id: profile_id },
                { isActive: false }
            );
            res.status(200).json({message: "The session state has been set to inactive"});
        } else {
            // إذا لم توجد جلسة، يمكن إرسال رد بأن الجلسة غير موجودة
            res.status(404).json({message: "Session not found"});
        }
    } catch (error) {
        res.status(500).send({ message: "An error occurred", error: error });
    }
};
const addOrUpdateAction = async (req, res) => {
    try {
        const { action, url } = req.body;

        // تحديث السجل إذا وُجد، أو إنشاء واحد جديد إذا لم يُعثر على أي سجل
        const updatedAction = await Action.findOneAndUpdate(
            {}, // فلتر البحث (بحث عن أي سجل)
            { action, url }, // البيانات المُحدثة
            {
                new: true, // إرجاع السجل المُحدث
                upsert: true // إنشاء سجل جديد إذا لم يُعثر على أي سجل
            }
        );

        if (updatedAction) {
            // إرسال الرد مع السجل المُحدث أو المُنشأ
            return res.status(200).json({ message: "Action added or updated successfully", updatedAction });
        } else {
            // في حالة عدم نجاح العملية
            return res.status(400).json({ message: "Unable to add or update action" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error processing request" });
    }
};




module.exports = { login, register , Access_User,updateSessionStatus,setSessionInactive,addOrUpdateAction}
