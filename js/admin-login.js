const SUPABASE_URL = 'https://qpvnqtxxzgiokyilbvoj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdm5xdHh4emdpb2t5aWxidm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNDI0NzMsImV4cCI6MjEwNDkxODQ3M30.D3YghsoD_fxvO8mr8xzYCmNvrrsbOLJQ0O_Ns3UBCio';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('form-login').addEventListener('submit', async function (evento) {
    evento.preventDefault(); // Evita que la página se recargue al enviar el formulario

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorTexto = document.getElementById('login-error');

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        errorTexto.textContent = 'Correo o contraseña incorrectos.';
        return;
    }

    // Login exitoso: redirigimos al panel de administración
    window.location.href = 'admin.html';
});
