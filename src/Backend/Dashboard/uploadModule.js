const multer = require('multer');
const {v4:uuidv4} = require('uuid');


//建立一個用mimetype來對應副檔名的物件
const extMap = {
    'image/png':'.png',
    'image/jpeg':'.jpeg',
    'image/gif':'.gif',
};

const storage = multer.diskStorage({
    //若未設定diskStorage就會直接傳到指定位置不會傳到暫存資料夾
    //決定儲存位置:destination
    destination: function(req, file , cb){
        cb(null, __dirname+'/../../../public/adsCover')
        //公式:cb(null, __dirname+'/../public/img')
    },
    //決定儲存檔名:filename
    filename: function(req,file,cb){
        const ext = extMap[file.mimetype];
        //用物件裡的mimetype對照副檔名(ex:word檔：undefine)
        if(ext){
            cb(null,  uuidv4() + ext );
            //若符合三者之一 ->用物件決定副檔名
        }else{
            cb(new Error('不對哦'));
        }
    },
});

const fileFilter = function (req, file, cb){
    //存檔時先通過fileFilter,有通過才儲存
    cb(null, !!extMap[file.mimetype]);
    //有值才要,沒有值就不要
    //!!:不是沒有值->為轉換為布林值
    //!!'':false !!undefined:false
};

module.exports = multer({
    storage,fileFilter,
});
