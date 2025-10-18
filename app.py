from flask import Flask, request, jsonify, render_template
from chatbot_puzzle_game import AIChatbotPuzzleGame
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
games = {}  # Store game instances for different sessions

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/start', methods=['POST'])
def start_game():
    data = request.json
    session_id = data.get('session_id', 'default')
    player_name = data.get('player_name', 'Adventurer')
    
    logger.debug(f"Starting game for session {session_id} with player {player_name}")
    
    # Create a new game instance
    games[session_id] = AIChatbotPuzzleGame()
    games[session_id].player_name = player_name
    
    # Get the introduction message
    intro = games[session_id].start_game()
    
    return jsonify({
        'message': intro,
        'score': games[session_id].score
    })

@app.route('/api/command', methods=['POST'])
def process_command():
    data = request.json
    session_id = data.get('session_id', 'default')
    command = data.get('command', '')
    
    logger.debug(f"Processing command '{command}' for session {session_id}")
    
    # Get or create game instance
    if session_id not in games:
        logger.debug(f"Creating new game instance for session {session_id}")
        games[session_id] = AIChatbotPuzzleGame()
    
    # Process the command
    response = games[session_id].process_command(command)
    logger.debug(f"Response: {response[:50]}...")  # Log first 50 chars of response
    
    return jsonify({
        'message': response,
        'score': games[session_id].score
    })

@app.route('/debug/<session_id>', methods=['GET'])
def debug_session(session_id):
    if session_id in games:
        game = games[session_id]
        puzzle_info = {
            "bfs_puzzles": game.bfs_solver.get_available_puzzles(),
            "current_bfs_puzzle": game.bfs_solver.current_puzzle,
            "current_module": game.current_module
        }
        return jsonify(puzzle_info)
    else:
        return jsonify({"error": "Session not found"})

if __name__ == '__main__':
    app.run(debug=True)