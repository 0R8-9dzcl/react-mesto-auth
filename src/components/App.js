import React from "react";
import { Route } from "react-router";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import api from "../utils/api";
import EditAvatarPopup from "./EditAvatarPopup";
import EditProfilePopup from "./EditProfilePopup";
import AddPlacePopup from "./AddPlacePopup ";
import DeletePlacePopup from "./DeletePlacePopup";


function App() {
	const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
	const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
	const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
	const [isDeletePlacePopupOpen, setIsDeletePlacePopupOpen] = React.useState(false);
	const [selectedCard, setSelectedCard] = React.useState({name: '', link: ''});
	const [deletingcard, setDeletingcard] = React.useState({});
	const [cards, setCards] = React.useState([]);
	// currenUser
	const [currentUser, setCurrentUser] = React.useState({ name:'', about:''});
	React.useEffect(() => {
		Promise.all([api.getUserInfo(), api.getCards()])
		.then(([userInfo, cardList]) => {
			setCurrentUser(userInfo);
			setCards(cardList)
		})
		.catch(err => console.log(err))
	}, []);
	React.useEffect(() => {
		api.getCards()
		.then((cardList) => {
			setCards(cardList)
		})
		.catch(err => console.log(err))
	}, []);
	// Popups
	const handleEditAvatarClick = () => {
		setIsEditAvatarPopupOpen(true);
	};
	const handleEditProfileClick = () => {
		setIsEditProfilePopupOpen(true);
	};
	const handleAddPlaceClick = () => {
		setIsAddPlacePopupOpen(true);
	};
	const handleDeletePlaceClick = (card) => {
		setIsDeletePlacePopupOpen(true);
		setDeletingcard(card);
	};
	const handleCardClick  = (card) => {
		setSelectedCard(card);
	}
	const closeAllPopups = () => {
		setIsEditAvatarPopupOpen(false);
		setIsEditProfilePopupOpen(false);
		setIsAddPlacePopupOpen(false);
		setIsDeletePlacePopupOpen(false);
		setSelectedCard({name: '', link: ''});
		setDeletingcard({});
	};
	// UserData
	function handleUpdateUser(data) {
		api.setUserInfo(data.name, data.description)
		.then(res => {
			setCurrentUser(res);
			closeAllPopups();
		})
		.catch(err => console.log(err));
	}
	function handleUpdateAvatar(data) {
		api.updAvatar(data.avatar)
		.then(res => {
			setCurrentUser(res);
			closeAllPopups();
		})
		.catch(err => console.log(err));
	}
	// Cards
	
	function handleCardLike(card) {
		// Проверяем, есть ли уже лайк на этой карточке
		const isLiked = card.likes.some(i => i._id === currentUser._id);
		
		// Отправляем запрос в API и получаем обновлённые данные карточки
		api.changeLikeCardStatus(card._id, !isLiked)
		.then((newCard) => {
			setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
		})
		.catch(err => console.log(err));
	} 
	function handleCardDelete(card) {
		// Отправляем запрос в API и получаем обновлённые данные карточки
		api.deleteCard(card._id)
		.then(() => {
			setCards((state) => state.filter((c) => c._id !== card._id));
			closeAllPopups();
		})
		.catch(err => console.log(err));
	}
	// add places
	function handleAddPlace(data) {
		api.postCards(data.name, data.link)
		.then(newCard => {
			setCards([newCard, ...cards]);
			closeAllPopups();
		})
		.catch(err => console.log(err));
	}

	return (
		<CurrentUserContext.Provider value={currentUser}>
			<Header />
			<Main
				cards={cards}
				onEditAvatar={handleEditAvatarClick}
				onEditProfile={handleEditProfileClick}
				onAddPlace={handleAddPlaceClick}
				onCardClick={handleCardClick}
				onCardLike={handleCardLike}
				onCardDelete={handleDeletePlaceClick}
			/>
			<Footer />
			<EditAvatarPopup
				isOpen={isEditAvatarPopupOpen} 
				onClose={closeAllPopups}
				onUpdateAvatar={handleUpdateAvatar} 
			/>
			<EditProfilePopup
				isOpen={isEditProfilePopupOpen} 
				onClose={closeAllPopups} 
				onUpdateUser={handleUpdateUser} 
			/>
			<AddPlacePopup
				isOpen={isAddPlacePopupOpen} 
				onClose={closeAllPopups} 
				onAddPlace={handleAddPlace} 
			/>
			<DeletePlacePopup
				card={deletingcard}
				isOpen={isDeletePlacePopupOpen}
				onClose={closeAllPopups}
				onCardDelete={handleCardDelete}
			/>				
			<ImagePopup card={selectedCard} onClose={closeAllPopups} />
		</CurrentUserContext.Provider>
	);
}

export default App;