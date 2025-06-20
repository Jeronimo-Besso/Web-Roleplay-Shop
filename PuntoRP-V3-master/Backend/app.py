from flask import Flask, redirect, request, session, render_template, url_for
import requests
import re
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from flask import Flask
from flask_cors import CORS
from flask import Flask, request, jsonify
from flask import send_from_directory
import os
from werkzeug.utils import secure_filename
import mercadopago


sdk = mercadopago.SDK("APP_USR-3486310097630310-061917-acbd34e358f29f37728e0520091078fc-192395582")
engine = create_engine(
    "mysql+pymysql://root:43809990Jero!@localhost/web-roleplay", echo=True
)


app = Flask(__name__, static_folder='Frontend/pagos_html')
@app.route('/<path:filename>')
def static_html_pages(filename):
    return send_from_directory(app.static_folder, filename)



CORS(app, supports_credentials=True)
app.secret_key = "clave_secreta"
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "mysql+pymysql://root:43809990Jero!@localhost/web-roleplay"
)
STEAM_API_KEY = "0105BBAD8986E750F7C826E0BA0DD84E"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


########################      CREACION DE CLASES     #############################################################################################
@app.errorhandler(Exception)
def handle_exception(e):
    # Podés distinguir tipos de error si querés
    response = {"error": str(e), "type": type(e).__name__, "path": request.path}
    return jsonify(response)

########################   
@app.route('/success.html')
def success_page():
    return send_from_directory('../Frontend/templates', 'success.html')

@app.route('/failure.html')
def failure_page():
    return send_from_directory('../Frontend/templates', 'failure.html')

@app.route('/pending.html')
def pending_page():
    return send_from_directory('../Frontend/templates', 'pending.html')




@app.route("/crear_pago", methods=["POST"])
def crear_pago():
    data = request.get_json()
    print("📨 Datos recibidos para pago:", data)

    preference_data = {
    "items": [{
        "title": data.get("nombre", "Producto"),
        "quantity": 1,
        "unit_price": float(data.get("precio", 0))
    }],
    "back_urls": {
        "success": "http://localhost:5500/Frontend/pagos_html/success.html",
        "failure": "http://localhost:5500/Frontend/pagos_html/failure.html",
        "pending": "http://localhost:5500/Frontend/pagos_html/pending.html"
    },
    "auto_return": "approved"
}


    try:
        print("🚀 Enviando preferencia a Mercado Pago...")
        preference_response = sdk.preference().create(preference_data)
        print("📦 Respuesta completa:", preference_response)

        init_point = preference_response.get("response", {}).get("init_point")
        if init_point:
            return jsonify({"init_point": init_point})
        else:
            print("❌ Error: No se recibió init_point")
            return jsonify({"error": "Preferencia inválida"}), 500

    except Exception as e:
        print("❌ Error creando preferencia:", e)
        return jsonify({"error": "No se pudo crear el pago"}), 500
########################   

class Membresias(db.Model):
    __tablename__ = "membresias"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    precio = db.Column(db.Integer, nullable=False)
    detalles = db.Column(db.String(200), nullable=False)

    def __init__(self, nombre, precio, detalles):
        self.nombre = nombre
        self.precio = precio
        self.detalles = detalles

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "precio": self.precio,
            "detalles": self.detalles,
        }

    @classmethod
    def crearMembresias(cls, nombre, precio, detalles):
        try:
            db.session.add(Membresias(nombre, precio, detalles))
            db.session.commit()
        finally:
            db.session.close()

    def modificar_membresias(cls, nombre):
        mafia = db.session.query(cls).filter_by(Nombre=nombre).first()
        if not mafia:
            return None
        else:
            return mafia

    @classmethod
    def eliminarMembresias(cls, nombre):
        membresia_eliminar = db.session.query(cls).filter_by(nombre=nombre).first()
        if membresia_eliminar:
            db.session.delete(membresia_eliminar)
            db.session.commit()
        else:
            raise ValueError(f"No se encontró membresía con nombre {nombre}")


    @classmethod
    def get_all_membresias(cls):
        membresias = db.session.query(cls).all()
        if not membresias:
            return None
        else:
            return membresias


class Usuario(db.Model):
    __tablename__ = "usuarios"
    id = db.Column(db.Integer, primary_key=True)
    steam_id = db.Column(db.String(50), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    avatar_url = db.Column(db.String(200))
    ban = db.Column(
        db.Integer, nullable=False, default=0
    )  # 0 = no baneado, 1 = baneado

    def __init__(self, steam_id, nombre, avatar_url=None):
        self.nombre = nombre
        self.steam_id = steam_id
        self.avatar_url = avatar_url

    def to_dict(self):
        return {
            "id": self.id,
            "steam_id": self.steam_id,
            "nombre": self.nombre,
            "avatar_url": self.avatar_url,
            "ban": self.ban,
        }  # esto lo que hace es crear en diccionario para luego poder pasarlo a JSON

    @classmethod
    def crearUsuario(cls, steam_id, nombre, avatar_url=None, ban=0):
        nuevo_usuario = cls(steam_id, nombre, avatar_url)
        nuevo_usuario.ban = ban
        db.session.add(nuevo_usuario)
        db.session.commit()


    @classmethod
    def get_all_usuarios(cls):
        usuarios = db.session.query(cls).all()
        if not usuarios:
            return None
        else:
            return usuarios
        # ACA HAY QUE CREAR UNA TABLA QUE MUESTRE TODOS LOS SUARIOS EN THML CON BOTON
        # CUANDO SE PRESIONE EL BOTON SE VA A MOSTRAR TODAS LAS ACCIONES PARA EL USUARIO

    def get_usuario_by_steam_id(
        cls, steam_id
    ):  # ESTA FUNCION SE LLAMA DESDE LA DE ARRIBA
        usuario = db.session.query(cls).filter_by(steam_id=steam_id).first()
        if not usuario:
            return None
        else:
            return usuario

    def banear_usuario(cls, steam_id):
        usuario = db.session.query(cls).filter_by(steam_id=steam_id).first()
        if not usuario:
            return None
        else:
            usuario.ban = 1
            db.session.commit()
            db.session.close()

@app.route("/crear_usuario")
def crear_usuario(steam_id, nombre, ban=0):
    Usuario.crearUsuario(steam_id, nombre, ban)
    return print("Creado con exito!")


@app.route("/login")
def login():
    return redirect(
        "https://steamcommunity.com/openid/login"
        "?openid.ns=http://specs.openid.net/auth/2.0"
        "&openid.mode=checkid_setup"
        "&openid.return_to=http://localhost:5000/authorize"
        "&openid.realm=http://localhost:5000/"
        "&openid.identity=http://specs.openid.net/auth/2.0/identifier_select"
        "&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select"
    )


CEOS = [
    "76561198218106975",
    "x",
]

ADMINS = [
    "a",
    "x",
]


def is_admin(steam_id):
    return steam_id in ADMINS


def is_ceo(steam_id):
    return steam_id in CEOS


@app.route("/authorize")
def authorize():
    steam_url = request.args.get("openid.claimed_id")
    if steam_url:
        match = re.search(r"/id/(\d+)|/profiles/(\d+)|/openid/id/(\d+)", steam_url)
        if match:
            steam_id = match.group(1) or match.group(2) or match.group(3)
            session["steam_id"] = steam_id

            usuario = Usuario.query.filter_by(steam_id=steam_id).first()

            if usuario:
                # Ya existe → usar datos locales
                session["nombre"] = usuario.nombre
                session["avatar_url"] = usuario.avatar_url
                print(f"🔁 Usuario recuperado desde BD: {usuario.nombre}")
            else:
                # No existe → consultar Steam
                perfil = get_steam_profile(steam_id)
                if perfil:
                    nombre = perfil["personaname"]
                    avatar = perfil["avatarfull"]
                    Usuario.crearUsuario(nombre=nombre, steam_id=steam_id, avatar_url=avatar)
                    session["nombre"] = nombre
                    session["avatar_url"] = avatar
                    print(f"✅ Usuario creado: {nombre}")
                else:
                    print("⚠️ Error: no se pudo obtener perfil desde Steam")
                    return redirect(url_for("home"))  # o página de error

            return redirect("http://localhost:5500/Frontend/templates/index.html")
    return redirect(url_for("http://localhost:5500/Frontend/templates/index.html"))

@app.route("/api/session")
def check_session():
    steam_id = session.get("steam_id")
    nombre = session.get("nombre")
    avatar_url = session.get("avatar_url")

    if steam_id and nombre:
        return {
            "logged_in": True,
            "nombre": nombre,
            "avatar_url": avatar_url,
            "steam_id": steam_id
        }
    return {"logged_in": False}



@app.route("/logout")
def logout():
    session.clear()
    return redirect("http://localhost:5500/Frontend/templates/index.html")



@app.route("/admin")
def admin_panel():
    steam_id = session.get("steam_id")
    if not steam_id or not is_admin(steam_id):
        return redirect(url_for("http://localhost:5500/Frontend/templates/index.html"))
    return render_template("http://localhost:5500/Frontend/templates/index.html")


def get_steam_profile(steam_id):
    url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={STEAM_API_KEY}&steamids={steam_id}"
    response = requests.get(url)

    if response.status_code == 200:
        try:
            data = response.json()
            players = data.get("response", {}).get("players", [])
            if players:
                return players[0]
        except ValueError:
            print("⚠️ Error: respuesta no es JSON válido")
    else:
        print(f"⚠️ Error al contactar Steam: {response.status_code}")

    return None
class Coins(db.Model):
    __tablename__ = "coins"
    Id = db.Column(db.Integer, primary_key=True)
    Precio = db.Column(db.Integer, nullable=False)
    Cantidad = db.Column(db.Integer, nullable=False)

    def __init__(self, Precio, Cantidad):
        self.Precio = Precio
        self.Cantidad = Cantidad

    def to_dict(self):
        return {"id": self.Id, "precio": self.Precio, "cantidad": self.Cantidad}

    @classmethod
    def get_all_coins(cls):
        coins = db.session.query(cls).all()
        if not coins:
            return None
        else:
            return coins

    @classmethod
    def crearCoins(cls, precio, cantidad):
        db.session.add(Coins(precio, cantidad))
        db.session.commit()
        db.session.close()
        return

    def get_coins_by_cantidad(cls, cantidad):
        coins = db.session.query(cls).filter_by(Cantidad=cantidad).first()
        if not coins:
            return None
        else:
            return coins

    def modificar_coins(cls, precio, cantidad):
        coins = db.session.query(cls).filter_by(Cantidad=cantidad).first()
        if not coins:
            return None
        else:
            coins.Precio = precio
            db.session.commit()
            db.session.close()

    @classmethod
    def eliminar_coins(cls, cantidad):
        coins = db.session.query(cls).filter_by(Cantidad=cantidad).first()
        if not coins:
            return None
        else:
            db.session.delete(coins)
            db.session.commit()
            db.session.close()














class Mafias(db.Model):
    __tablename__ = "mafias"
    Id = db.Column(db.Integer, primary_key=True)
    Nombre = db.Column(db.String(50), nullable=False)
    Precio = db.Column(db.Integer, nullable=False)
    Detalles = db.Column(db.String(200), nullable=False)

    def __init__(self, Nombre, Precio, Detalles):
        self.Nombre = Nombre
        self.Precio = Precio
        self.Detalles = Detalles

    def to_dict(self):
        return {
            "id": self.Id,
            "nombre": self.Nombre,
            "precio": self.Precio,
            "detalles": self.Detalles,
        }

    @classmethod
    def crearMafia(cls, Nombre, Precio, Detalles):
        nueva_mafia = cls(Nombre=Nombre, Precio=Precio, Detalles=Detalles)
        db.session.add(nueva_mafia)
        db.session.commit()

    @classmethod
    def get_all_mafias(cls):
            mafias = db.session.query(cls).all()
            if not mafias:
                return None
            else:
                return mafias

    def get_mafia_by_name(cls, nombre):
        mafia = db.session.query(cls).filter_by(Nombre=nombre).first()
        if not mafia:
            return None
        else:
            return mafia  # objeto

    def editar_mafia(cls, nombre, detalle, precio):
        mafia = db.session.query(cls).filter_by(Nombre=nombre).first()
        if not mafia:
            return None
        else:
            mafia.Detalles = detalle
            mafia.Precio = precio
            db.session.commit()
            db.session.close()


class Vehiculos(db.Model):
    __tablename__ = "vehiculos"
    Id = db.Column(db.Integer, primary_key=True)
    Nombre = db.Column(db.String(50), nullable=False)
    Precio = db.Column(db.Integer, nullable=False)
    Detalles = db.Column(db.String(200), nullable=False)
    vehiculo_img = db.Column(db.String(200))

    def __init__(self, Nombre, Precio, Detalles,vehiculo_img):
        self.Nombre = Nombre
        self.Precio = Precio
        self.Detalles = Detalles
        self.vehiculo_img = vehiculo_img

    @classmethod
    def crearVehiculo(cls, nombre, precio, detalle,vehiculo_img):
        db.session.add(cls(nombre, precio, detalle,vehiculo_img))
        db.session.commit()
        db.session.close()
        return "creado con exito", 201

    def to_dict(self):
        return {
            "id": self.Id,
            "nombre": self.Nombre,
            "precio": self.Precio,
            "detalles": self.Detalles,
            "vehiculo_img": self.vehiculo_img
        }

    def get_vehiculo_by_name(cls, nombre):
        vehiculo = db.session.query(cls).filter_by(Nombre=nombre).first()
        if not vehiculo:
            return None
        else:
            return vehiculo  # objeto

    def get_all_vehiculos(cls):
        vehiculos = db.session.query(cls).all()
        if not vehiculos:
            return None
        else:
            return vehiculos


    def edit_vehiculo(cls, nombre, precio, detalle,vehiculo_img_nuevo):
        vehiculo = db.session.query(cls).filter_by(Nombre=nombre).first()
        if not vehiculo:
            return None
        else:
            vehiculo.Precio = precio
            vehiculo.Detalles = detalle
            vehiculo.vehiculo_img = vehiculo_img_nuevo
            db.session.commit()
            db.session.close()

@app.route("/get_all_membresias", methods=["GET"])
def get_all_membresias():
    membresias = Membresias.get_all_membresias()
    membresias_json = [
        m.to_dict() for m in membresias
    ]  # CONVIERTO todos los objetos  a JSON

    return jsonify(membresias_json)


@app.route("/get_all_vehiculos")
def get_all_vehiculos():
    vehiculos = Vehiculos.query.all()
    return jsonify([v.to_dict() for v in vehiculos])


@app.route("/get_all_mafias",methods=['GET'])
def get_all_mafias():
    mafias = Mafias.get_all_mafias()
    mafias_json = [m.to_dict() for m in mafias]
    return jsonify(mafias_json)


@app.route("/get_all_coins", methods=["GET"])
def get_all_coins():
    coins = Coins.get_all_coins()
    coins_json = [c.to_dict() for c in coins]

    return jsonify(coins_json)


###################################################################
@app.route("/crear_vehiculo", methods=["POST"])
def crear_vehiculo():
    # Asegurarte que recibís los datos del form y el archivo
    nombre = request.form.get("nombre")
    precio = request.form.get("precio")
    detalle = request.form.get("detalle")
    archivo = request.files.get("vehiculo_img")  # <-- Archivo recibido aquí

    if not nombre or not precio or not detalle:
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    if archivo:
        # Guarda el archivo en una carpeta, por ejemplo "static/imgs"
        carpeta_destino = os.path.join("static", "imgs")
        if not os.path.exists(carpeta_destino):
            os.makedirs(carpeta_destino)

        nombre_archivo = archivo.filename
        ruta_guardado = os.path.join(carpeta_destino, nombre_archivo)
        archivo.save(ruta_guardado)
    else:
        nombre_archivo = None  # O un valor por defecto

    # Luego, creás el vehículo pasando el nombre_archivo (nombre del archivo guardado)
    Vehiculos.crearVehiculo(nombre, precio, detalle, nombre_archivo)

    return jsonify({"éxito": "Se creó el vehículo"}), 201


@app.route("/crear_mafia", methods=["POST"])
def crear_mafia():
    data = request.get_json()

    nombre = data.get("nombre")
    precio = data.get("precio")
    detalle = data.get("detalle")

    if not nombre or not precio or not detalle:
        return jsonify({"error": "Faltan campos requeridos"}), 400

    Mafias.crearMafia(nombre, precio, detalle)
    return jsonify({"mensaje": "Mafia creada con éxito"}), 201



@app.route("/crear_coins", methods=["POST"])
def crear_coins():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON recibido"}), 400
    precio = data.get("precio")
    cantidad = data.get("cantidad")
    if not precio or not cantidad:
        return jsonify({"Error": "No se reciben los parametros"}), 400
    Coins.crearCoins(precio, cantidad)
    return jsonify({"exito": "Coin creado con exito"}), 201


@app.route("/crear_membresia", methods=["POST"])
def crear_membresia():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON recibido"}), 400
    nombre = data.get("nombre")
    precio = data.get("precio")
    detalles = data.get("detalles")
    if not nombre or not precio or not detalles:
        return jsonify({"error": "Faltan campos requeridos"}), 400
    Membresias.crearMembresias(nombre, precio, detalles)
    return jsonify({"mensaje": "Creado con éxito!"}), 201



###################################

@app.route("/eliminar_membresia", methods=["POST"])
def eliminar_memb():
    data = request.get_json()
    nombre = data.get("nombre")
    Membresias.eliminarMembresias(nombre)
    return jsonify({"mensaje": "Se ha eliminado con exito"})

@app.route("/eliminar_coins", methods=["POST"])
def eliminar_coin():
    data = request.get_json()
    cantidad = data.get("cantidad")
    Coins.eliminar_coins(cantidad)
    return jsonify({"mensaje": "Se ha eliminado con exito"})

@app.route("/eliminar_vehiculo", methods=["POST"])
def eliminar_vehiculo():
    data = request.get_json()
    nombre = data.get("nombre")

    if not nombre:
        return jsonify({"error": "Nombre no recibido"}), 400

    vehiculo = db.session.query(Vehiculos).filter_by(Nombre=nombre).first()
    if not vehiculo:
        return jsonify({"error": "Vehículo no encontrado"}), 404

    db.session.delete(vehiculo)
    db.session.commit()
    return jsonify({"mensaje": "Vehículo eliminado con éxito"}), 200


@app.route("/eliminar_mafia", methods=["POST"])
def eliminar_mafia():
    data = request.get_json()
    nombre = data.get("nombre")
    print(nombre)
    if not nombre:
        return jsonify({"error": "Nombre no recibido"}), 400

    mafia = db.session.query(Mafias).filter_by(Nombre=nombre).first()
    if not mafia:
        return jsonify({"error": "Mafia no encontrada"}), 404

    db.session.delete(mafia)
    db.session.commit()
    return jsonify({"mensaje": "Mafia eliminada con éxito"}), 200







if __name__ == "__main__":
    app.run(debug=True)
