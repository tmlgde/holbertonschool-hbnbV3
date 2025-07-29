from app.models.user import User
from app.models.amenity import Amenity
from app.models.place import Place
from app.models.review import Review
from app.models.amenities_places import AmenityPlace
from app.persistence.user_repository import UserRepository
from app.persistence.amenity_repository import AmenityRepository
from app.persistence.place_repository import PlaceRepository
from app.persistence.review_repository import ReviewRepository

class HBnBFacade:
    def __init__(self):
        self.user_repo = UserRepository()
        self.amenity_repo = AmenityRepository()
        self.place_repo = PlaceRepository()
        self.review_repo = ReviewRepository()

    # USER
    def create_user(self, user_data):
        user = User(**user_data)
        self.user_repo.add(user)
        return user
    
    def get_users(self):
        return self.user_repo.get_all()

    def get_user(self, user_id):
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        return self.user_repo.get_by_attribute('email', email)
    
    def update_user(self, user_id, user_data):
        self.user_repo.update(user_id, user_data)
    
    # AMENITY
    def create_amenity(self, amenity_data):
        amenity = Amenity(**amenity_data)
        self.amenity_repo.add(amenity)
        return amenity

    def get_amenity(self, amenity_id):
        return self.amenity_repo.get(amenity_id)

    def get_all_amenities(self):
        return self.amenity_repo.get_all()

    def update_amenity(self, amenity_id, amenity_data):
        return self.amenity_repo.update(amenity_id, amenity_data)

    # PLACE
    def create_place(self, place_data, owner_id):
        user = self.user_repo.get_by_attribute('id', owner_id)
        if not user:
            raise KeyError('Invalid input data')
        place_data['owner'] = user
        amenities = place_data.pop('amenities', None)
        if amenities:
            for a in amenities:
                amenity = self.get_amenity(a['id'])
                if not amenity:
                    raise KeyError('Invalid input data')
        place = Place(**place_data)
        self.place_repo.add(place)
        user.add_place(place)
        if amenities:
            for amenity in amenities:
                place.add_amenity(amenity)
        return place

    def get_place(self, place_id):
        return self.place_repo.get(place_id)

    def get_all_places(self):
        places = self.place_repo.get_all()
        for place in places:
            print(f"Place: {place.id}, owner: {place.owner}, user_id: {place.user_id}")
        return places
        
    def update_place(self, place_id, place_data):
        return self.place_repo.update(place_id, place_data)
    
    def delete_place(self, place_id):
        self.place_repo.delete(place_id)

    # REVIEWS
    def create_review(self, review_data, user_id):
        user = self.user_repo.get(user_id)
        if not user:
            raise KeyError("Invalid input data")
        review_data['user'] = user
 
        place = self.place_repo.get(review_data['place_id'])
        if not place:
            raise KeyError("Invalid input data")
        del review_data['place_id']
        review_data['place'] = place

        if place.owner.id == user.id:
            raise KeyError("You cannot review your own place.")

        for r in place.reviews:
            if r.user.id == user.id:
                raise KeyError('You have already reviewed this place.')

        review = Review(**review_data)
        self.review_repo.add(review)
        user.add_review(review)
        place.add_review(review)
        return review
        
    def get_review(self, review_id):
        return self.review_repo.get(review_id)

    def get_all_reviews(self):
        return self.review_repo.get_all()

    def get_reviews_by_place(self, place_id):
        place = self.place_repo.get(place_id)
        if not place:
            raise KeyError('Place not found')
        return place.reviews

    def update_review(self, review_id, review_data):
        return self.review_repo.update(review_id, review_data)

    def delete_review(self, review_id):
        review = self.review_repo.get(review_id)
        
        user = self.user_repo.get(review.user.id)
        place = self.place_repo.get(review.place.id)

        user.delete_review(review)
        place.delete_review(review)
        self.review_repo.delete(review_id)
