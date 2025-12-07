

const getMainForm = (props) => {
    const {p, op, headerText, edit} = props;
    const formName = "MainForm" + p + op;
    
    const idModal = Id.modal(p, op);
    const idClear = "clear" + p + op;
    const idSubmit = Id.submit(p, op);
    const idContents = "inputs" + p + op;
    
    const idName = Id.name(p, op);
    const idAmount = Id.amount(p, op);
    const idDay = Id.day(p, op);
    const idInterval = Id.interval(p, op);
    const idComment = Id.comment(p, op);
    
    const class1 = edit? CLASS_VALID + " form-group" : "form-group";
    const class2 = edit? CLASS_VALID + " form-control" : "form-control";
    const disableSubmit = edit? "" : "disabled";
     
    const patterns = {
        text: /[a-zA-Z][a-zA-Z0-9]*/,
        money: /^\d+(\.\d{2})?$/,
        numeric: /^\d+$/,
        any: /^.*$/
    };
    
    const clear = () => {
        const children = document.getElementById(idContents)?.children;
        
        for (let formGroup of children) {
            formGroup.className = "form-group";
            
            const formControl = formGroup.children[1];
            formControl.className = "form-control";
            formControl.value = "";
        }

        document.getElementById(idSubmit).disabled = true;
    };

    const validate = (name, pattern) => {
        const haveValidAll = (children) => {
            for (let child of children) {
                if(!child.className.startsWith(CLASS_VALID)){
                    return false;
                }
            }

            return true;
        };

        const idInput = p + op + name;
        const idGroup = "group" + idInput;
        const value = document.getElementById(idInput).value;

        const className = (value?.match(patterns[pattern]))? CLASS_VALID : CLASS_INVALID;
        document.getElementById(idInput).className = className + " form-control";
        document.getElementById(idGroup).className = className + " form-group";

        const children = document.getElementById(idContents)?.children;
        document.getElementById(idSubmit).disabled = !children || !haveValidAll(children);
    };

    const accept = () => {
        const elName = document.getElementById(idName);
        const elAmount = document.getElementById(idAmount);
        const elDay = document.getElementById(idDay);
        const elInterval = document.getElementById(idInterval);
        const elComment = document.getElementById(idComment);
      
        const name = elName.value;
        if(op === OP_ADD && Store.nameExists(p, name)){
            const storeType = (p === P_BILL)? "bills" : "income";
            alert(`'${name}' already exists in '${storeType}'`);
            return;
        }

        const data = {
            name: name,
            amount: elAmount.value,
            day: elDay.value,
            interval: Number(elInterval.value),
            comment: elComment.value,
            startDate: DateMath.findStartDate(elDay.value),
            p: p
        };

        Store.upsert(p, data);
        Store.toConsole();
        genListForms();
    };

    // generate form groups by type
    const inputTypes = {
        text: (item) => {
            const {name, labelText, placeholder, pattern} = item;
            const formGroupClass = edit? "":"";
            const idInput = p + op + name;
            const idGroup = "group" + idInput;
            
            return `
                <div id=${idGroup} class="${class1}">
                    <label for="${idInput}" >${labelText}</label>
                    <input type="text" class="${class2}" id="${idInput}" placeholder="${placeholder}" value="" 
                        oninput="${formName}.validate('${name}', '${pattern}')" 
                           name="${idInput}" >
                </div>`;
        },
        textArea: (item) => {
            const {name, labelText, placeholder, pattern} = item;
            const idInput = p + op + name;
            const idGroup = "group" + idInput;
            return `
                <div id=${idGroup} class="${class1}">
                    <label for="${idInput}" >${labelText}</label>
                    <textarea class="${class2}" rows="5" id="${idInput}" 
                        oninput="${formName}.validate('${name}', '${pattern}')" 
                           name="${idInput}" ></textarea>
                </div>`;
        }
    };

    const gen = () => {
        const modalDiv = document.createElement('div');
        modalDiv.classList.add('modal', 'fade');
        modalDiv.id = idModal;
        modalDiv.setAttribute('tabindex', '-1');
        modalDiv.setAttribute('role', 'dialog');
        modalDiv.setAttribute('aria-labelledby', `${idModal}Label`);
        modalDiv.setAttribute('aria-hidden', 'true');

        const items = [
            {name: "name", labelText: "Name", placeholder: "Enter name", inputType: "text", pattern: "text"},
            {name: "amount", labelText: "Amount", placeholder: "Enter amount", inputType: "text", pattern: "money"},
            {name: "day", labelText: "Day of Month", placeholder: "Day of month", inputType: "text", pattern: "numeric"},
            {name: "interval", labelText: "Interval", placeholder: "Interval in days (0 to bypass)", inputType: "text", pattern: "numeric"},
            {name: "comment", labelText: "Comment", placeholder: "", inputType: "textArea", pattern: "any"}
        ];
        
        const formGroups = items.map((item) => {
            return inputTypes[item.inputType](item);
        });

        modalDiv.innerHTML = `
          <div class="modal-dialog modal-dialog-scrollable modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" Label">${headerText}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="container-fluid " id="${idContents}" >
                    ${formGroups.join(" ")}
                </div>
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-success" data-dismiss="modal"
                        onclick="${formName}.accept()" id="${idSubmit}" ${disableSubmit} >Submit</button>
                  <button type="button" class="btn btn-warning"
                        onclick="${formName}.clear()" id="${idClear}" >Clear</button>
                  <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        `;

        const dest = document.getElementById("forms");
        dest.appendChild(modalDiv);
        return modalDiv;
    };
    
    return {
        gen: (props) => gen(props),
        clear: () => clear(),
        validate: (p, op, name, pattern) => validate(p, op, name, pattern),
        accept: (p, op) => accept(p, op)
    };
};