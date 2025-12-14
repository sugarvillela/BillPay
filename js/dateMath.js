const CAL_NULL = "calDay calNull";
const CAL_ACTIVE = "calDay calActive";
const CAL_NOW = "calDay calNow";

const DateMath = (() => {
    const yyyymmdd = (isoString) => {
        let yyyy, mm, dd;
        
        //2025-12-03T
        if(isoString){
            yyyy = isoString.substring(0, 4);
            mm = isoString.substring(5, 7);
            dd = isoString.substring(8, 10);
        }
        else{
            date = new Date();
            yyyy = date.getFullYear();
            mm = String(date.getMonth() + 1).padStart(2, '0');
            dd = String(date.getDate()).padStart(2, '0');
            
        }

        return`${yyyy}-${mm}-${dd}`;
    };
    const addDayFromDate = (items) => {
        for(let item of items){
            item.day = item.startDate.substring(8, 10) - 0;
        }
        return items;
    };
    const getMonthObj = (date) => {
        const mFirst = new Date(date.getFullYear(), date.getMonth(), 1);
        const mLast = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const now = new Date();
        
        const weekStart = mFirst.getDay();
        const daysInMonth = mLast.getDate();
        
        const currMonth = mFirst.getMonth();
        const nowDay = now.getDate();
        const nowMonth = now.getMonth();
        const calList = [];

        // blank before
        for(let i = 0; i < weekStart; i++){
            calList.push({
                className: CAL_NULL,
                value: ""
            });
        }
        
        // days + get today index
        for(let i = 1; i <= daysInMonth; i++){
            if(i === nowDay && currMonth === nowMonth){
                calList.push({
                    className: CAL_NOW,
                    value: `${i}`
                });
            }
            else {
                calList.push({
                    className: CAL_ACTIVE,
                    value: `${i}`
                });
            }
        }
        
        // blank after
        for(let i = daysInMonth; i <= 35; i++){
            calList.push({
                className: CAL_NULL,
                value: ""
            });
        }
        
        return {
            mFirst: mFirst,
            daysInMonth: daysInMonth,
            calList: calList
        };
    };
    const findStartDate = (d) => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), d);
        return startDate.toISOString();  
    };
    const compareMonth = (a, b) => {
        const ya = a.getFullYear();
        const yb = b.getFullYear();
        if(ya < yb){
            return 1;
        }
        if(ya > yb){
            return -1;
        }
        
        const ma = a.getMonth();
        const mb = b.getMonth();
        if(ma < mb){
            return 1;
        }
        if(ma > mb){
            return -1;
        }
        return 0;
    };
    /* private */const findIntervalDays = (then, now, interval, daysInMonth) => {
        const mCompare = compareMonth(then, now);
        let day0;
        
        if(mCompare < 0){
            return [];
        }
        else if(mCompare > 0){
            const diff = Math.round((now.getTime() - then.getTime()) / 86400000);
            
            const mult = Math.ceil(diff/interval);
            day0 = (mult * interval) - diff + 1;
            //console.log(`diff ${diff} mult ${mult} day0 ${day0}`)
        }
        else {
            day0 = then.getDate();
        }
        
        const intervalDays = [];
        for(let d = day0; d <= daysInMonth; d += interval){
            intervalDays.push(d);
        }

        return intervalDays;//Math.abs(interval = rem);

    };
    const genIntervalItems = (mObj, item) => {
        const then = new Date(item.startDate);
        const intervalDays = findIntervalDays(then, mObj.mFirst, item.interval, mObj.daysInMonth);
        return intervalDays.map(day => {
            return {...item, day: day};
        });
    };
    
    return {
        yyyymmdd: (date) => yyyymmdd(date),
        addDayFromDate: (items) => addDayFromDate(items),
        getMonthObj: (dateObj) => getMonthObj(dateObj),
        findStartDate: (d) => findStartDate(d),
        compareMonth: (a, b) => compareMonth(a, b),
        genIntervalItems: (mObj, item) => genIntervalItems(mObj, item)
    };
})();