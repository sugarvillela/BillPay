var openEdit = (p, selectedName) => {
    const values = Store.findByName(p, selectedName);
    if(values){
        const nextIdName = Id.name(p, OP_EDIT);
        const nextIdAmount = Id.amount(p, OP_EDIT);
        const nextIdDate = Id.date(p, OP_EDIT);
        const nextIdInterval = Id.interval(p, OP_EDIT);
        const nextIdComment = Id.comment(p, OP_EDIT);
        const nextIdModal = Id.modal(p, OP_EDIT);

        document.getElementById(nextIdName).value = values.name;
        document.getElementById(nextIdAmount).value = values.amount;
        document.getElementById(nextIdDate).value = DateMath.yyyymmdd(values.startDate);
        document.getElementById(nextIdInterval).value = values.interval;
        document.getElementById(nextIdComment).value = values.comment;

        const m = document.getElementById(nextIdModal);
        new bootstrap.Modal(m).show();
    }
};
const getListForm = (props) => {
    const {p, op, headerText} = props;
    
    const formName = "ListForm" + p + op;
    const idModal = Id.modal(p, op);
    const idSelect = "select" + p + op;
    
    let selectedName = "";
    let names;
    
    const onChange = (index) => {
        selectedName = names[index];
        document.getElementById(Id.submit(p, op)).disabled = false;
    };

    const accept = () => {
        if(op === OP_REMOVE){
            Store.removeByName(p, selectedName);
            
            Store.toConsole();
            genListForms();
        }
        else {
            openEdit(p, selectedName);
        }
        selectedName = "";
    };
    
    const genOptions = () => {
        return names.map(n => `
            <option value="${n}">${n}</option>
        `);
    };
    
    const gen = () => {
        names = Store.getNames(p);

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
                <h5 class="modal-title" Label">${props.headerText}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="container-fluid " >
                    <select class="form-select form-select-lg" size="${names.length}" aria-label="listForm" 
                        id="${idSelect}"
                        onChange="${formName}.onChange(this.selectedIndex)">
                      ${genOptions()}
                    </select>
                </div>
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-success" data-dismiss="modal" 
                        onclick="${formName}.accept()" id="${Id.submit(p, op)}" disabled >Submit</button>
                  <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        `;

        const dest = document.getElementById("listForms");
        dest.appendChild(modalDiv);
        return modalDiv;
    };

    return {
        gen: () => gen(),
        onChange: (index) => onChange(index),
        accept: () => accept()
    };
};