"option strict"
$(document).ready(function () {
    $("#btnLoginA").on("click", function (e) { 
            e.preventDefault();
            
            let loginRQ = inviaRichiesta('/api/loginA', 'POST', { "codFA": $("#txtCodFA").val(), "pwd": $("#txtPwdA").val() });
            loginRQ.fail(function (jqXHR, test_status, str_error) {
                if (jqXHR.status == 401) {
                    $("#txtCodFA").html("");
                    $("#txtPwdA").html("");
                }
                else {
                    error(jqXHR, test_status, str_error);                    
                }
            });
            loginRQ.done(function (data) {
                sessionStorage.setItem("codiceFiscale", $("#txtCodFA").val());                
                window.location.href = "AreaRiservata.html";
            });
        
        
    });

    $("#btnLoginU").on("click", function (e) { 
        e.preventDefault();
        
        let loginRQ = inviaRichiesta('/api/loginU', 'POST', { "codFU": $("#txtCodFU").val(), "pwdU": $("#txtPwdU").val() });
        loginRQ.fail(function (jqXHR, test_status, str_error) {
            if (jqXHR.status == 401) {
                $("#txtCodFU").html("");
                $("#txtPwdU").html("");
            }
            else {
                error(jqXHR, test_status, str_error);                    
            }
        });
        loginRQ.done(function (data) {
            sessionStorage.setItem("codiceFiscale", $("#txtCodFU").val());                
            window.location.href = "AreaRiservataU.html";
        });

        
    
    });

    $("#btnSignA").on("click", function()
    {
        if($("#cfA").val() != "" && $("#nomeA").val() != "" && $("#cognomeA").val() != "" && $("#dnA").val() != "" && $("#pwdA").val() != "" && $("#telA").val() != "" && $("#pwdA").val() == $("#pwd2A").val()){
            let params = {
                codiceFiscaleA: $("#cfA").val(),
                nomeA: $("#nomeA").val(),
                cognomeA: $("#cognomeA").val(),
                DataNascitaA: $("#dnA").val(),
                telefonoA: $("#telA").val(),
                passwordA:$("#pwdA").val()
            }
            let amministratore = inviaRichiesta("/api/insertAmministratore", "POST", params);
            console.log(params);               

            amministratore.fail(function (jqXHR, test_status, str_error) {
                error(jqXHR, test_status, str_error);
            });
            amministratore.done(function(data){
                alert("Inserito");
                $("#cfA").val("");
                $("#nomeA").val("");
                $("#cognomeA").val("");
                $("#dnA").val("");
                $("#pwdA").val("");
                $("#telA").val("");
                $("#pwdA").val("");
                $("#pwd2A").val("");

            });
        }
        else
        alert("Completa tutti i campi");
            
    
    });

    $("#btnSignC").on("click", function()
    {
        if($("#cfC").val() != "" && $("#nomeC").val() != "" && $("#cognomeC").val() != "" && $("#dnC").val() != "" && $("#pwdC").val() != "" && $("#telC").val() != "" && $("#pwdC").val() == $("#pwd2C").val()){
            let params = {
                codiceFiscaleC: $("#cfC").val(),
                nomeC: $("#nomeC").val(),
                cognomeC: $("#cognomeC").val(),
                DataNascitaC: $("#dnC").val(),
                telefonoC: $("#telC").val(),
                passwordC:$("#pwdC").val()
            }
            let condomino = inviaRichiesta("/api/insertCondomino", "POST", params);
            console.log(params);               

            condomino.fail(function (jqXHR, test_status, str_error) {
                error(jqXHR, test_status, str_error);
            });
            condomino.done(function(data){
                alert("Inserito");
                $("#cfC").val("");
                $("#nomeC").val("");
                $("#cognomeC").val("");
                $("#dnC").val("");
                $("#pwdC").val("");
                $("#telC").val("");
                $("#pwdC").val("");
                $("#pwd2C").val("");

            });
        }
        else
        alert("Completa tutti i campi");
            
    
    });
        
       
    
    
});
function controlloCampi() {
    let result;
    alert("Entro");

    if ($("#cfA").val() == "" || $("#nomeA").val() == "" || $("#cognomeA").val() == "" || $("#dnA").val() == "" || $("#pwdA").val() == "" || $("#telA").val() == "")
        result = false;
    else if ($("#pwdA").val() == $("#pwd2A").val())
        result = true;
    else 
        result=false;
    alert(result);
    return result;
}

