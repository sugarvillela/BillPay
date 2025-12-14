const P_BILL = "b";     // prefix for bill
const P_INCOME = "i";   // prefix for income
const STOR_KEY = "billpay3814722";

const CLASS_VALID = "valid";
const CLASS_INVALID = "trouble";

const OP_ADD = "add";
const OP_EDIT_CHOOSE = "editchoose";
const OP_EDIT = "edit";
const OP_REMOVE = "remove";

const getStore = (p) => {
    let data = [];

    const init = () => {
        const str = localStorage.getItem(p + STOR_KEY);
        
        if(str){
            try{
                data = JSON.parse(str);
                for(let d of data){// fix js string-number confusion
                    d.interval = (d.interval -0);
                }
            }
            catch(err){
                console.error("Error parsing JSON:", err.message);
                alert("Store empty or invalid json");
            }
        }
        else{
            localStorage.setItem(p + STOR_KEY, "[]");
            data = [];
        }
    };
    const indexOf = (name) => {
        return data.findIndex(d => d.name === name);
    };
    const findByName = (name) => {
        const index = indexOf(name);
        return (index === -1)? null : data[index];
    };
    const upsert = (newData) => {
        const index = indexOf(newData.name);
        
        if(index === -1){
            data.push(newData);
        }
        else{
            // don't overwrite existing start date
//            if(data[index].hasOwnProperty("startDate")){
//                newData.startDate = data[index].startDate;
//                newData.day = data[index].day;
//            }
            data[index] = newData;
        }

        localStorage.setItem(p + STOR_KEY, JSON.stringify(data));
    };
    const removeByName = (name) => {
        const index = data.findIndex(d => d.name === name);
        if(index === -1){
            throw new Error(`'${name}' not found in type '${p}'`);
        }
        else{
            data.splice(index, 1);
        }
        localStorage.setItem(p + STOR_KEY, JSON.stringify(data));
    };
    const replaceData = (newData) => {
        data = newData;
        const str = JSON.stringify(newData);
        localStorage.setItem(p + STOR_KEY, str);
    };
    
    return {
        init: () => init(),
        indexOf: (name) => indexOf(name),
        upsert: (newData) => upsert(newData),
        removeByName: (name) => removeByName(name),
        replaceData: (str) => replaceData(str),
        getData: () => data,
        getMonthlyItems: () => data.filter(d => !d.interval),
        getIntervalItems: () => data.filter(d => !!d.interval),
        findByName: (name) => findByName(name)
    };
};
const Store = (() => {
    const store = {
        [P_BILL]: getStore(P_BILL),
        [P_INCOME]: getStore(P_INCOME)
    };
    
    const init = () => {
        store[P_BILL].init();
        store[P_INCOME].init();
    };
    
    const importData = (jsonObj) => {
        const bills = (jsonObj.hasOwnProperty("bills"))? jsonObj.bills : [];
        const income = (jsonObj.hasOwnProperty("income"))? jsonObj.income : [];
        store[P_BILL].replaceData(bills);
        store[P_INCOME].replaceData(income);
    };
    
    const getFormatted = () => {
        const allData = {
            bills: store[P_BILL].getData(),
            income: store[P_INCOME].getData()
        };
        
        return JSON.stringify(allData, null, 4); // 4 spaces for indentation
    };
    
    const toClipboard = async () => {
        try {
            await navigator.clipboard.writeText(getFormatted());
            console.log('Text copied to clipboard successfully!');
        } 
        catch (err) {
            console.error('Failed to copy text: ', err);
            alert("Failed copy to clipboard");
        }
    };
    
    const toConsole = () => {
        console.warn(new Date().toISOString());
        console.log(getFormatted());
    };
    
    return {
        init: () => init(),
        nameExists: (p, name) => store[p].indexOf(name) !== -1,
        upsert: (p, newData) => store[p].upsert(newData),
        removeByName: (p, name) => store[p].removeByName(name),
        getData: (p) => store[p].getData(),
        getMonthlyItems: (p) => store[p].getMonthlyItems(),
        getIntervalItems: (p) => store[p].getIntervalItems(),
        getNames: (p) => store[p].getData().map(d => d.name),
        findByName: (p, name) => store[p].findByName(name),
        toConsole: () => toConsole(),
        importData: (jsonObj) => importData(jsonObj),
        getFormatted: () => getFormatted(),
        toClipboard: () => toClipboard()
    };
})();

const Id = (() => {
    return {
        name: (p, op) => p + op + "name",
        amount: (p, op) => p + op + "amount",
        date: (p, op) => p + op + "date",
        interval: (p, op) => p + op + "interval",
        comment: (p, op) => p + op + "comment",
        
        submit: (p, op) => "submit" + p + op,
        modal: (p, op) => "modal" + p + op
    };
})();