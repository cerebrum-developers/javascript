export default function ({ store, redirect }) {
	console.log('redirect', (redirect))
	if (!localStorage.getItem('authToken')) {
		console.log(redirect)
		return redirect('login')
	}
}
