const getMonthlySource = (p) => {
    let items = [];
    
    const addItems = (mObj) => {
        items = Store.getMonthlyItems(p);
        items = DateMath.addDayFromDate(items); // need day as number
        const offset = mObj.mFirst.getDay();    // position of first day in table

        for(let item of items){
            const then = new Date(item.startDate);
            if(DateMath.compareMonth(then, mObj.mFirst) >= 0){// skip if before start date
                const dObj = mObj.calList[item.day + offset - 1];

                if(!dObj.hasOwnProperty("items")){// allow more than one item per day
                    dObj.items = [];
                }
                dObj.items.push(item);
            }
        }
        return mObj;
    };
    return {
        addItems: (mObj) => addItems(mObj)
    };
};
const getIntervalSource = (p) => {
    let items = [];
    
    const addItems = (mObj) => {
        items = Store.getIntervalItems(p);
        const offset = mObj.mFirst.getDay();
 
        for(let i = 0; i < items.length; i++){           
            const intervalItems = DateMath.genIntervalItems(mObj, items[i]);

            for(let j = 0; j < intervalItems.length; j++){
                const dObj = mObj.calList[intervalItems[j].day + offset - 1];
                
                if(!dObj.hasOwnProperty("items")){
                    dObj.items = [];
                }
                dObj.items.push(intervalItems[j]);
            }
        }
        return mObj;
    };
    return {
        addItems: (mObj) => addItems(mObj)
    };
};

const MonthlySource = (() => {
    const source = {
        [P_BILL]: getMonthlySource(P_BILL),
        [P_INCOME]: getMonthlySource(P_INCOME)
    };
    
    return {
        addItems: (p, mObj) => source[p].addItems(mObj)
    };
})();
const IntervalSource = (() => {
    const source = {
        [P_BILL]: getIntervalSource(P_BILL),
        [P_INCOME]: getIntervalSource(P_INCOME)
    };
    
    return {
        addItems: (p, mObj) => source[p].addItems(mObj)
    };
})();

const CalGen = (() => {
    let mObj;
    
    /*private*/ const genCalHeader = () => {
        const currDate = mObj.mFirst;
        const m = currDate.toLocaleString('default', { month: 'long' });
        const y = currDate.getFullYear();
        document.getElementById("mDisp").innerHTML = `${m} ${y}`;
    };
    
    /*private*/ const changeMonth = (n) => {
        const currDate = mObj.mFirst;
        const m = currDate.getMonth();
        currDate.setMonth(m + n);
        // get month data
        mObj = DateMath.getMonthObj(currDate);
        // add monthly items disp
        mObj = MonthlySource.addItems(P_BILL, mObj);
        mObj = MonthlySource.addItems(P_INCOME, mObj);
        mObj = IntervalSource.addItems(P_BILL, mObj);
        mObj = IntervalSource.addItems(P_INCOME, mObj);
        genCalHeader();
        gen();
    };
    
    /*private*/ const getItemText = (item) => {
        const div = document.createElement("div");
        div.className = "item" + item.p;    // text color
        div.title = item.comment;           // tooltip for comment
        div.addEventListener('dblclick', () => {
            openEdit(item.p, item.name);
        });

        div.appendChild(
            document.createTextNode(
                `${item.name} $${item.amount}`
            )
        );
        div.appendChild(
            document.createElement("br")
        );
        return div;
    };
    
    const gen = () => {
        for(let i = 0; i < mObj.calList.length; i++){
            const parent = document.getElementById("td" + i);
            const dObj = mObj.calList[i];
            
            const calDay = document.createElement("div");
            calDay.className = dObj.className;
            
            if(dObj.value){
                calDay.appendChild(
                    document.createTextNode(dObj.value)
                );
                calDay.appendChild(
                    document.createElement("br")
                );
        
                if(dObj.items){
                    for(let item of dObj.items){
                        calDay.appendChild(
                            getItemText(item)
                        );
                    }
                }
            }

            parent.appendChild(calDay);
        }
    };
    
    const init = () => {
        mObj = DateMath.getMonthObj(new Date());
        
        mObj = MonthlySource.addItems(P_BILL, mObj);
        mObj = MonthlySource.addItems(P_INCOME, mObj);
        mObj = IntervalSource.addItems(P_BILL, mObj);
        mObj = IntervalSource.addItems(P_INCOME, mObj);

        genCalHeader();
        gen();
    };
    return {
        init: () => init(),
        mInc: () => changeMonth(1),
        mDec: () => changeMonth(-1),
        changeMonth: (n) => changeMonth(n),
        gen: () => gen()
    };
})();