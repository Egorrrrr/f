from datetime import datetime
import json
from unicodedata import name
from flask import Flask, redirect, request, make_response
from flask import render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_login import login_user
from flask_login import logout_user
from flask_login import UserMixin
from flask_login import login_required, logout_user
import hashlib
from flask_login import current_user
from flask_migrate import Migrate
from pip import main
import time


app = Flask(__name__, static_folder="static")
app.jinja_env.auto_reload = True
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///users.db'
app.config['SECRET_KEY'] = 'you-will-never-guess'
db = SQLAlchemy(app)
migrate = Migrate(app, db) # this
login_manager = LoginManager()
login_manager.init_app(app)


followers = db.Table('followers',
    db.Column('follower_id', db.Integer, db.ForeignKey('user_class.id')),
    db.Column('followed_id', db.Integer, db.ForeignKey('user_class.id'))
)

class UserClass(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(256), nullable=False, unique=True)
    password = db.Column(db.String(512), nullable=False)
    posts = db.relationship("Post", backref="author", lazy="dynamic")
    followed = db.relationship(
            'UserClass', secondary=followers,
            primaryjoin=(followers.c.follower_id == id),
            secondaryjoin=(followers.c.followed_id == id),
            backref=db.backref('followers', lazy='dynamic'), lazy='dynamic')

    def follow(self, user):
        if not self.is_following(user):
            self.followed.append(user)
        db.session.commit()

    def unfollow(self, user):
        if self.is_following(user):
            self.followed.remove(user)
        db.session.commit()

    def is_following(self, user):
        return self.followed.filter(
            followers.c.followed_id == user.id).count() > 0
    def get_all_followers(self):
        return self.followed.all()


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String(140))
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user_class.id'))

@login_manager.user_loader
def load_user(user_id):
    return UserClass.query.get(user_id)


@app.route('/main')
@login_required
def main():

    name = request.cookies.get('name')
    return render_template('home.html', message=f"Вы успешно вошли, {name}", users = UserClass.query.all())


@app.route('/')
def reg():
    if current_user.is_authenticated:
        return redirect("/main")
    return render_template('reg.html')


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/create_user', methods=["POST"])
def create_user():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        password = hashlib.sha256(
            request.form["password"].encode()).hexdigest()
        user = UserClass(name=name, email=email, password=password)
        try:
            db.session.add(user)
            db.session.commit()

        except Exception:
            return "taken"
        login_user(user, remember=request.form["accept"])
        resp = make_response(redirect("/main"))
        resp.set_cookie('name', name)
        return resp


@app.route('/sign_in', methods=["POST"])
def sign_in():
    if request.method == "POST":

        res = UserClass.query.filter_by(email=request.form["login"]).first()
        if res.password == hashlib.sha256(request.form["password"].encode()).hexdigest():
            name = res.name
            if "accept" in request.form:
                login_user(res,remember=request.form["accept"])
            else:
                login_user(res)
            resp = make_response(redirect("/main"))
            resp.set_cookie('name', name)
            return resp

@app.route('/loadPosts', methods=["GET"])
@login_required
def loadPosts():
    mail = request.args["mail"]
    user = UserClass.query.filter_by(email=mail).first()
    arr = []
    posts = user.posts.all()
    for post in posts:
        arr.append({"body":post.body, "id":post.id})
    return json.dumps(arr)

@app.route('/addpost', methods=["POST"])
@login_required
def addPost():
    mail = request.args["mail"]
    post = request.args["post"]
    user = UserClass.query.filter_by(email=mail).first()
    p = Post(body=post, author=user)
    db.session.add(p)
    db.session.commit()
    return "success"


@app.route('/editpost', methods=["POST"])
@login_required
def editPost():
    pid = request.args["id"]
    post = request.args["post"]
    Post.query.filter_by(id=pid).update(dict(body=post))
    db.session.commit()
    return "success"

@app.route('/delpost', methods=["POST"])
@login_required
def delPost():
    pid = request.args["id"]
    Post.query.filter_by(id=pid).delete()
    db.session.commit()
    return "success"

@app.route('/get_followers', methods=["GET"])
@login_required
def get_followers():
    print("dsadasd")
    mail = request.args["mail"]
    user = UserClass.query.filter_by(email=mail).first()
    arr = []
    followersss =user.get_all_followers()
    for fol in followersss:
        arr.append(str(fol.email))
    return json.dumps(arr)

@app.route('/logout', methods=["POST"])
@login_required
def logout():
    logout_user()
    return "logged out"


@app.route('/follow', methods=["POST"])
@login_required
def follow():
    mail = request.args["mail"]
    to_follow = request.args["user"]
    user = UserClass.query.filter_by(email=mail).first()
    to_follow = UserClass.query.filter_by(email=to_follow).first()
    user.followed.append(to_follow)
    db.session.commit()
    return "success"


@app.route('/unfollow', methods=["POST"])
@login_required
def unfollow():
    mail = request.args["mail"]
    to_follow = request.args["user"]
    user = UserClass.query.filter_by(email=mail).first()
    to_follow = UserClass.query.filter_by(email=to_follow).first()
    user.followed.remove(to_follow)
    db.session.commit()
    return "success"


@login_manager.unauthorized_handler
def unauthorized_callback():
    return redirect('/login')

if __name__ == "__main__":
    app.run(debug=True)