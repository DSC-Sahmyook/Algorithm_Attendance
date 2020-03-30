if (process.argv.length < 3) {
    console.log("Usage: node " + process.argv[1] + " __FILE__PATH__");
    process.exit(1);
}

var fs = require("fs"),
    filename = process.argv[2],
    attendances_path = "./attendances.json",
    config_path = "./config.json",
    config = {};

var fn = {
    init : (file_path, attendances_path) => {
        config = JSON.parse(fn.read(config_path));
        var attendances_list_raw = fn.read(attendances_path);
        var attendances_list = JSON.parse(attendances_list_raw);
        var data = fn.read(file_path);
        var parsed = fn.parse(data);
        var result = fn.analysis(parsed, attendances_list);
        fn.makeFile(result);
    },
    read : (path)=>{   
        try{
            var data = fs.readFileSync(path, "utf8");
            // console.log("FILE LOADED : " + path);
            return data;
        }
        catch (e){
            throw e;
        }
    },
    parse : raw =>{
        raw = raw.replace(/(?:\r\n|\r|\n)/g, '');
        var attendances =[];
        var splited = raw.split(config.char_split_list);
        splited.map(item=>{
            if(item !== ""){ 
                var splited_person = item.split(config.char_split_person);
                var attendance = {
                    "name" : splited_person[0],
                    "time_stamp" : config.char_split_person + splited_person[1].trim()
                };
                attendances.push(attendance);
            }
        });

        return attendances;
    },
    makeFile : attendances=>{
        try{
            var attendances_stringfied = JSON.stringify(attendances);
            var _path = filename.replace("./data","./result").replace(".txt",".json");
            var isExists = fs.existsSync(_path);
            if(isExists){
                fs.unlinkSync(_path);
            }

            fs.writeFileSync(_path, attendances_stringfied);    
            console.log("성공했습니다. \n다음 위치를 확인해주세요 : " , _path);
        }
        catch (e){
            console.log("오류가 발생했습니다.");
            console.log(e);
        }
    },
    analysis : (attendances, list) =>{
        var cnt = attendances.length;
        var total_cnt = list.length;
        attendances.map(item=>{
            var position = list.indexOf(item.name);
            if(position >= 0){
                // attendedList.push(item.name);
                list.splice(position,1);
            }
        });
        
        console.log("## 총 출석 인원 수 : " + cnt + "/" + total_cnt);
        console.log("## 불참자 목록 : " + list.toString());
        return {
            cnt : cnt,
            notAttendedCnt : list.length,
            attendances : attendances,
            notAttendedList : list,
        };
    }
}

// 실제 실행 부 
fn.init(filename, attendances_path);