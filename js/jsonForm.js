const getJsonForm = (props) => {
    const {headerText, op} = props;
    const formName = "Formj" + op;
    
    const idModal = "modalj" + op;

    const idClear = "clearj" + op;
    const idSubmit = "submitj" + op;
    const idContents = "inputsj" + op;
    const idInput = "inputj" + op;
    const idGroup = "groupj" + op;
    
    let rows = 30;
    
    const clear = () => {
        document.getElementById(idInput).value = "";
        document.getElementById(idInput).className = " form-control";
        document.getElementById(idGroup).className = " form-group";
        document.getElementById(idSubmit).disabled = true;
    };

    const validate = () => {
        let className;
        const value = document.getElementById(idInput).value.trim();
        
        if(value){
            const valueRows = (value.match(/\n/g) || []).length + 1;
            if(valueRows > rows){
                rows = valueRows + 1;
                document.getElementById(idInput).rows = valueRows;
            }
        
            className = CLASS_VALID;
            document.getElementById(idSubmit).disabled = false;
        }
        else {
            className = CLASS_INVALID;
            document.getElementById(idSubmit).disabled = true;
        }
        
        document.getElementById(idInput).className = className + " form-control";
        document.getElementById(idGroup).className = className + " form-group";
    };

    const accept = () => {       
        const jsonString = document.getElementById(idInput).value.trim();
        
        try {
            const jsonObj = JSON.parse(jsonString);
            Store.importData(jsonObj);
            //Store.exportData();
            genListForms();
        } 
        catch (err) {
            console.error("Error parsing JSON:", err.message);
            alert("Not valid json");
        }
    };
    
    const setValue = () => {
        const value = Store.getFormatted();
        const valueRows = (value.match(/\n/g) || []).length + 1;
        
        const textArea = document.getElementById(idInput);

        if(valueRows > rows){
            rows = valueRows;
            textArea.rows = valueRows;
        }
        textArea.value = value;
        document.getElementById(idSubmit).disabled = !value;
    };

    // generate form groups by type
    const genTextArea = () => {
        return `
            <div id=${idGroup} class="form-group">
                <textarea class="form-control" rows="${rows}" id="${idInput}" 
                    oninput="${formName}.validate()" 
                       name="${idInput}" ></textarea>
            </div>`;
    };

    const gen = () => {
        const modalDiv = document.createElement('div');
        modalDiv.classList.add('modal', 'fade');
        modalDiv.id = idModal;
        modalDiv.setAttribute('tabindex', '-1');
        modalDiv.setAttribute('role', 'dialog');
        modalDiv.setAttribute('aria-labelledby', `${idModal}Label`);
        modalDiv.setAttribute('aria-hidden', 'true');

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
                    ${genTextArea()}
                </div>
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-success" data-dismiss="modal"
                        onclick="${formName}.accept()" id="${idSubmit}" disabled >Submit</button>
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
        accept: (p, op) => accept(p, op),
        setValue: () => setValue()
    };
};